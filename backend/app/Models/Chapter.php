<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chapter extends Model
{
    protected $fillable = [
        'manga_id',
        'title',
        'number',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'decimal:2',
        ];
    }

    public function manga(): BelongsTo
    {
        return $this->belongsTo(Manga::class);
    }
}
