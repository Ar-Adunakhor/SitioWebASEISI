<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'role_title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'avatar_emoji' => 'nullable|string|max:10',
            'linkedin' => 'nullable|url|max:255',
            'github' => 'nullable|url|max:255',
            'instagram' => 'nullable|url|max:255',
        ];
    }
}
