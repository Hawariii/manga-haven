<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'manga_id' => $this->manga_id,
            'last_chapter' => $this->last_chapter,
            'manga' => new MangaResource($this->whenLoaded('manga')),
            'chapter' => new ChapterResource($this->whenLoaded('chapter')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
