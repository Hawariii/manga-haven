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
            'views' => $this->views,
            'status' => $this->status,
            'chapters_count' => $this->whenCounted('chapters'),
            'favorites_count' => $this->whenCounted('favorites'),
            'latest_chapter' => new ChapterResource($this->whenLoaded('latestChapter')),
            'chapters' => ChapterResource::collection($this->whenLoaded('chapters')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
