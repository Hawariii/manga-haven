<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChapterRequest;
use App\Http\Requests\UpdateChapterRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ChapterController extends Controller
{
    public function store(StoreChapterRequest $request, Manga $manga): JsonResponse
    {
        $chapter = $manga->chapters()->create($request->validated());

        return $this->successResponse(
            new ChapterResource($chapter),
            'Chapter created successfully.',
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateChapterRequest $request, Chapter $chapter): JsonResponse
    {
        $chapter->update($request->validated());

        return $this->successResponse(new ChapterResource($chapter->refresh()), 'Chapter updated successfully.');
    }

    public function destroy(Chapter $chapter): JsonResponse
    {
        $chapter->delete();

        return $this->successResponse(null, 'Chapter deleted successfully.');
    }
}
