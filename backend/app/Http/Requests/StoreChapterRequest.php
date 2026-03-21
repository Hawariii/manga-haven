<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'number' => [
                'required',
                'numeric',
                'min:0',
                Rule::unique('chapters', 'number')->where(
                    fn ($query) => $query->where('manga_id', $this->route('manga')->id)
                ),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('chapters', 'slug')->where(
                    fn ($query) => $query->where('manga_id', $this->route('manga')->id)
                ),
            ],
            'published_at' => ['nullable', 'date'],
            'is_locked' => ['nullable', 'boolean'],
        ];
    }
}
