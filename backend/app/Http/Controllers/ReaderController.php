<?php

namespace App\Http\Controllers;

use App\Http\Resources\ChapterResource;
use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Http\JsonResponse;

class ReaderController extends Controller
{
    public function show(string $mangaSlug, string $chapterSlug): JsonResponse
    {
        $manga = Manga::query()
            ->where('slug', $mangaSlug)
            ->where('is_published', true)
            ->firstOrFail();

        $chapter = Chapter::query()
            ->with(['pages', 'manga'])
            ->withCount('pages')
            ->where('manga_id', $manga->id)
            ->where('slug', $chapterSlug)
            ->firstOrFail();

        $previousChapter = Chapter::query()
            ->where('manga_id', $manga->id)
            ->where('number', '<', $chapter->number)
            ->orderByDesc('number')
            ->first();

        $nextChapter = Chapter::query()
            ->where('manga_id', $manga->id)
            ->where('number', '>', $chapter->number)
            ->orderBy('number')
            ->first();

        return $this->successResponse([
            'manga' => [
                'id' => $manga->id,
                'title' => $manga->title,
                'slug' => $manga->slug,
                'cover' => $manga->cover,
            ],
            'chapter' => new ChapterResource($chapter),
            'navigation' => [
                'previous' => $previousChapter ? [
                    'id' => $previousChapter->id,
                    'slug' => $previousChapter->slug,
                    'title' => $previousChapter->title,
                    'number' => (float) $previousChapter->number,
                ] : null,
                'next' => $nextChapter ? [
                    'id' => $nextChapter->id,
                    'slug' => $nextChapter->slug,
                    'title' => $nextChapter->title,
                    'number' => (float) $nextChapter->number,
                ] : null,
            ],
        ]);
    }
}
