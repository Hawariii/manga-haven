<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHistoryRequest;
use App\Http\Resources\HistoryResource;
use App\Models\Chapter;
use App\Models\History;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $history = $request->user()
            ->history()
            ->with(['manga', 'chapter'])
            ->latest('updated_at')
            ->paginate((int) $request->integer('per_page', 20));

        return $this->successResponse(HistoryResource::collection($history));
    }

    public function store(StoreHistoryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $chapter = Chapter::query()->findOrFail($validated['last_chapter']);

        if ((int) $chapter->manga_id !== (int) $validated['manga_id']) {
            return $this->errorResponse('The chapter does not belong to the selected manga.', 422);
        }

        $history = History::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'manga_id' => $validated['manga_id'],
            ],
            [
                'last_chapter' => $validated['last_chapter'],
            ]
        );

        return $this->successResponse(
            new HistoryResource($history->load(['manga', 'chapter'])),
            'History saved successfully.'
        );
    }
}
