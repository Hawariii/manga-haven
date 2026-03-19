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
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:manga,slug'],
            'cover' => ['required', 'string', 'max:2048'],
            'views' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'string', 'max:100'],
        ];
    }
}
