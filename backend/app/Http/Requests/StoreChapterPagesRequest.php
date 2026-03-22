<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChapterPagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pages' => ['required', 'array', 'min:1'],
            'pages.*' => ['required', 'image', 'max:5120'],
        ];
    }
}
