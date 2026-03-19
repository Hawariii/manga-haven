<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Manga extends Model
{
    protected $table = 'manga';

    protected $fillable = [
        'title',
        'slug',
        'cover',
        'views',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'views' => 'integer',
        ];
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('number');
    }

    public function latestChapter(): HasOne
    {
        return $this->hasOne(Chapter::class)->latestOfMany('number');
    }

    public function history(): HasMany
    {
        return $this->hasMany(History::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }
}
