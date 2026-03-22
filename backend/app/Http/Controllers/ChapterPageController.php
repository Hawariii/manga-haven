<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChapterPagesRequest;
use App\Http\Resources\ChapterPageResource;
use App\Models\Chapter;
use App\Models\ChapterPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ChapterPageController extends Controller
{
    public function store(StoreChapterPagesRequest $request, Chapter $chapter): JsonResponse
    {
        $files = $request->file('pages', []);
        $nextPageNumber = ((int) ($chapter->pages()->max('page_number') ?? 0)) + 1;
        $storedPages = [];

        foreach ($files as $index => $file) {
            $path = $file->store(
                sprintf('chapter-pages/%s/%s', $chapter->manga_id, $chapter->id),
                'public'
            );

            $storedPages[] = $chapter->pages()->create([
                'page_number' => $nextPageNumber + $index,
                'image_url' => Storage::disk('public')->url($path),
                'width' => null,
                'height' => null,
            ]);
        }

        return $this->successResponse(
            ChapterPageResource::collection(collect($storedPages)),
            'Chapter pages uploaded successfully.',
            Response::HTTP_CREATED
        );
    }

    public function destroy(ChapterPage $chapterPage): JsonResponse
    {
        $storagePath = str_replace(Storage::disk('public')->url(''), '', $chapterPage->image_url);
        $normalizedPath = ltrim($storagePath, '/');

        if ($normalizedPath !== '') {
            Storage::disk('public')->delete($normalizedPath);
        }

        $chapter = $chapterPage->chapter;
        $deletedPageNumber = $chapterPage->page_number;
        $chapterPage->delete();

        $chapter->pages()
            ->where('page_number', '>', $deletedPageNumber)
            ->orderBy('page_number')
            ->get()
            ->each(function (ChapterPage $page): void {
                $page->decrement('page_number');
            });

        return $this->successResponse(null, 'Chapter page deleted successfully.');
    }
}
