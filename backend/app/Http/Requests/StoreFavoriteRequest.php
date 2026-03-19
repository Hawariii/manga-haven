<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFavoriteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'manga_id' => [
                'required',
                'integer',
                'exists:manga,id',
                Rule::unique('favorites', 'manga_id')->where(
                    fn ($query) => $query->where('user_id', $this->user()?->id)
                ),
            ],
        ];
    }
}
