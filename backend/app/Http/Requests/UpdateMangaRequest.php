<?php

namespace App\Http\Requests;

use App\Models\Manga;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMangaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Manga $manga */
        $manga = $this->route('manga');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('manga', 'slug')->ignore($manga?->id),
            ],
            'cover' => ['sometimes', 'required', 'string', 'max:2048'],
            'banner' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'description' => ['sometimes', 'nullable', 'string'],
            'author' => ['sometimes', 'nullable', 'string', 'max:255'],
            'artist' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'nullable', 'string', 'max:50'],
            'genres' => ['sometimes', 'nullable', 'array'],
            'genres.*' => ['string', 'max:100'],
            'release_year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:2100'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'views' => ['sometimes', 'required', 'integer', 'min:0'],
            'status' => ['sometimes', 'required', 'string', 'max:100'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
