<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'caption' => 'required|string|max:255',
            'image_url' => 'nullable|string',
            'emoji' => 'nullable|string|max:10',
            'gradient' => 'nullable|string|max:255',
        ];
    }
}
