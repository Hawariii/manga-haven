<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChapterPageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chapter_id' => $this->chapter_id,
            'page_number' => $this->page_number,
            'image_url' => $this->image_url,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
