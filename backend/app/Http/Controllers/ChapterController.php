<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChapterRequest;
use App\Http\Requests\UpdateChapterRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ChapterController extends Controller
{
    public function store(StoreChapterRequest $request, Manga $manga): JsonResponse
    {
        $validated = $request->validated();

        $chapter = $manga->chapters()->create([
            ...$validated,
            'slug' => $validated['slug'] ?? Str::slug($validated['title'].'-'.$validated['number']),
            'created_by' => $request->user()?->id,
        ]);

        return $this->successResponse(
            new ChapterResource($chapter),
            'Chapter created successfully.',
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateChapterRequest $request, Chapter $chapter): JsonResponse
    {
        $validated = $request->validated();

        if (
            (array_key_exists('title', $validated) || array_key_exists('number', $validated))
            && ! array_key_exists('slug', $validated)
        ) {
            $validated['slug'] = Str::slug(
                ($validated['title'] ?? $chapter->title).'-'.($validated['number'] ?? $chapter->number)
            );
        }

        $chapter->update($validated);

        return $this->successResponse(new ChapterResource($chapter->refresh()), 'Chapter updated successfully.');
    }

    public function destroy(Chapter $chapter): JsonResponse
    {
        $chapter->delete();

        return $this->successResponse(null, 'Chapter deleted successfully.');
    }
}
