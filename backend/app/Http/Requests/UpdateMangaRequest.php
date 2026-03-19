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
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('manga', 'slug')->ignore($manga?->id),
            ],
            'cover' => ['sometimes', 'required', 'string', 'max:2048'],
            'views' => ['sometimes', 'required', 'integer', 'min:0'],
            'status' => ['sometimes', 'required', 'string', 'max:100'],
        ];
    }
}
