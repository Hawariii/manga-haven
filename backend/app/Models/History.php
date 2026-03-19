<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class History extends Model
{
    protected $table = 'history';

    protected $fillable = [
        'user_id',
        'manga_id',
        'last_chapter',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'manga_id' => 'integer',
            'last_chapter' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function manga(): BelongsTo
    {
        return $this->belongsTo(Manga::class);
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class, 'last_chapter');
    }
}
