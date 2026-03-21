<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChapterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'manga_id' => $this->manga_id,
            'title' => $this->title,
            'number' => (float) $this->number,
            'slug' => $this->slug,
            'published_at' => $this->published_at?->toISOString(),
            'is_locked' => (bool) $this->is_locked,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
