<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'manga_id' => ['required', 'integer', 'exists:manga,id'],
            'last_chapter' => ['required', 'integer', 'exists:chapters,id'],
        ];
    }
}
