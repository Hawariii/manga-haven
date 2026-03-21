<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMangaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:manga,slug'],
            'cover' => ['required', 'string', 'max:2048'],
            'banner' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'author' => ['nullable', 'string', 'max:255'],
            'artist' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'genres' => ['nullable', 'array'],
            'genres.*' => ['string', 'max:100'],
            'release_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'country' => ['nullable', 'string', 'max:100'],
            'views' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'string', 'max:100'],
            'is_featured' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
        ];
    }
}
