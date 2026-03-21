<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChapterPage extends Model
{
    protected $fillable = [
        'chapter_id',
        'page_number',
        'image_url',
        'width',
        'height',
    ];

    protected function casts(): array
    {
        return [
            'page_number' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}
