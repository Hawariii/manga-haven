<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MangaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'cover' => $this->cover,
            'banner' => $this->banner,
            'views' => $this->views,
            'status' => $this->status,
            'description' => $this->description,
            'author' => $this->author,
            'artist' => $this->artist,
            'type' => $this->type,
            'genres' => $this->genres ?? [],
            'release_year' => $this->release_year,
            'country' => $this->country,
            'is_featured' => (bool) $this->is_featured,
            'is_published' => (bool) $this->is_published,
            'chapters_count' => $this->whenCounted('chapters'),
            'favorites_count' => $this->whenCounted('favorites'),
            'latest_chapter' => new ChapterResource($this->whenLoaded('latestChapter')),
            'chapters' => ChapterResource::collection($this->whenLoaded('chapters')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
