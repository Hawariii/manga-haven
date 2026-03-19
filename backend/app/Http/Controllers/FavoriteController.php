<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFavoriteRequest;
use App\Http\Resources\FavoriteResource;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->with('manga')
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return $this->successResponse(FavoriteResource::collection($favorites));
    }

    public function store(StoreFavoriteRequest $request): JsonResponse
    {
        $favorite = Favorite::create([
            'user_id' => $request->user()->id,
            'manga_id' => $request->integer('manga_id'),
        ]);

        return $this->successResponse(
            new FavoriteResource($favorite->load('manga')),
            'Favorite added successfully.',
            Response::HTTP_CREATED
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $favorite = $request->user()->favorites()->findOrFail($id);
        $favorite->delete();

        return $this->successResponse(null, 'Favorite removed successfully.');
    }
}
