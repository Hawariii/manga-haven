<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMangaRequest;
use App\Http\Requests\UpdateMangaRequest;
use App\Http\Resources\MangaResource;
use App\Models\Manga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MangaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $manga = Manga::query()
            ->withCount('chapters')
            ->with('latestChapter')
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status'))
            )
            ->orderByDesc('created_at')
            ->paginate((int) $request->integer('per_page', 12));

        return $this->successResponse(MangaResource::collection($manga));
    }

    public function show(string $slug): JsonResponse
    {
        $manga = Manga::query()
            ->withCount('chapters')
            ->with(['chapters', 'latestChapter'])
            ->where('slug', $slug)
            ->firstOrFail();

        $manga->increment('views');
        $manga->refresh()->loadCount('chapters')->load(['chapters', 'latestChapter']);

        return $this->successResponse(new MangaResource($manga));
    }

    public function topManga(Request $request): JsonResponse
    {
        $manga = Manga::query()
            ->withCount('chapters')
            ->with('latestChapter')
            ->orderByDesc('views')
            ->limit((int) $request->integer('limit', 10))
            ->get();

        return $this->successResponse(MangaResource::collection($manga));
    }

    public function store(StoreMangaRequest $request): JsonResponse
    {
        $manga = Manga::create([
            ...$request->validated(),
            'views' => $request->integer('views', 0),
        ]);

        return $this->successResponse(
            new MangaResource($manga->loadCount('chapters')),
            'Manga created successfully.',
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateMangaRequest $request, Manga $manga): JsonResponse
    {
        $manga->update($request->validated());

        return $this->successResponse(
            new MangaResource($manga->refresh()->loadCount('chapters')),
            'Manga updated successfully.'
        );
    }

    public function destroy(Manga $manga): JsonResponse
    {
        $manga->delete();

        return $this->successResponse(null, 'Manga deleted successfully.');
    }
}
