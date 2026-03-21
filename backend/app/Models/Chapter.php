<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chapter extends Model
{
    protected $fillable = [
        'manga_id',
        'title',
        'number',
        'slug',
        'published_at',
        'is_locked',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'decimal:2',
            'published_at' => 'datetime',
            'is_locked' => 'boolean',
        ];
    }

    public function manga(): BelongsTo
    {
        return $this->belongsTo(Manga::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(ChapterPage::class)->orderBy('page_number');
    }
}
