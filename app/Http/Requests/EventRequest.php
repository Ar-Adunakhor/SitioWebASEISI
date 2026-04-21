<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'emoji' => 'nullable|string',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'duration' => 'nullable|string',
            'status' => 'nullable|string',
            'gradient' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'visible' => 'boolean',
        ];
    }
}
