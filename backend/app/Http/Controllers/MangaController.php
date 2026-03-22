<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMangaRequest;
use App\Http\Requests\UpdateMangaRequest;
use App\Http\Resources\MangaResource;
use App\Models\Manga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class MangaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $isAdminRequest = $request->boolean('admin_all') && $request->user()?->role === 'admin';

        $manga = Manga::query()
            ->withCount(['chapters', 'favorites'])
            ->with([
                'latestChapter',
                ...($isAdminRequest ? ['chapters' => fn ($query) => $query->withCount('pages')->with('pages')->orderByDesc('number')] : []),
            ])
            ->when(! $isAdminRequest, fn ($query) => $query->where('is_published', true))
            ->when(
                $request->filled('q'),
                fn ($query) => $query->where(function ($builder) use ($request) {
                    $search = $request->string('q')->toString();
                    $builder
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('artist', 'like', "%{$search}%");
                })
            )
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status'))
            )
            ->when(
                $request->filled('type'),
                fn ($query) => $query->where('type', $request->string('type'))
            )
            ->when(
                $request->filled('country'),
                fn ($query) => $query->where('country', $request->string('country'))
            )
            ->when(
                $request->filled('featured'),
                fn ($query) => $query->where('is_featured', $request->boolean('featured'))
            )
            ->when(
                $request->filled('published') && $isAdminRequest,
                fn ($query) => $query->where('is_published', $request->boolean('published'))
            )
            ->when(
                $request->filled('genre'),
                fn ($query) => $query->whereJsonContains('genres', $request->string('genre')->toString())
            )
            ->orderByDesc('created_at')
            ->paginate((int) $request->integer('per_page', 12));

        return $this->successResponse(MangaResource::collection($manga));
    }

    public function show(string $slug): JsonResponse
    {
        $manga = Manga::query()
            ->withCount(['chapters', 'favorites'])
            ->with(['chapters' => fn ($query) => $query->withCount('pages')->orderByDesc('number'), 'latestChapter'])
            ->where('is_published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        $manga->increment('views');
        $manga->refresh()->loadCount(['chapters', 'favorites'])->load(['chapters', 'latestChapter']);

        return $this->successResponse(new MangaResource($manga));
    }

    public function topManga(Request $request): JsonResponse
    {
        $sort = $request->string('sort', 'views')->toString();
        $manga = Manga::query()
            ->withCount(['chapters', 'favorites'])
            ->with('latestChapter')
            ->where('is_published', true)
            ->orderByDesc($sort === 'favorites' ? 'favorites_count' : 'views')
            ->limit((int) $request->integer('limit', 10))
            ->get();

        return $this->successResponse(MangaResource::collection($manga));
    }

    public function store(StoreMangaRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $manga = Manga::create([
            ...$validated,
            'slug' => $validated['slug'] ?? Str::slug($validated['title']),
            'views' => $request->integer('views', 0),
            'is_featured' => $request->boolean('is_featured'),
            'is_published' => $request->has('is_published') ? $request->boolean('is_published') : true,
        ]);

        return $this->successResponse(
            new MangaResource($manga->loadCount(['chapters', 'favorites'])),
            'Manga created successfully.',
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateMangaRequest $request, Manga $manga): JsonResponse
    {
        $validated = $request->validated();

        if (array_key_exists('title', $validated) && ! array_key_exists('slug', $validated)) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $manga->update($validated);

        return $this->successResponse(
            new MangaResource($manga->refresh()->loadCount(['chapters', 'favorites'])),
            'Manga updated successfully.'
        );
    }

    public function destroy(Manga $manga): JsonResponse
    {
        $manga->delete();

        return $this->successResponse(null, 'Manga deleted successfully.');
    }
}
