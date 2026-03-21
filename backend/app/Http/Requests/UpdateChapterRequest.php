<?php

namespace App\Http\Requests;

use App\Models\Chapter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Chapter $chapter */
        $chapter = $this->route('chapter');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'number' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                Rule::unique('chapters', 'number')
                    ->ignore($chapter?->id)
                    ->where(fn ($query) => $query->where('manga_id', $chapter?->manga_id)),
            ],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('chapters', 'slug')
                    ->ignore($chapter?->id)
                    ->where(fn ($query) => $query->where('manga_id', $chapter?->manga_id)),
            ],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'is_locked' => ['sometimes', 'boolean'],
        ];
    }
}
