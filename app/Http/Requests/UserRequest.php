<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user')->id : null;
        return [
            'name' => 'required|string|max:255',
            'full_name' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $userId,
            'password' => $userId ? 'nullable|string|min:4' : 'required|string|min:4',
            'role' => 'required|in:admin,member',
        ];
    }
}
