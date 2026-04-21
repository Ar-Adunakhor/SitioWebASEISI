<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\UserRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('name')->get();
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    public function store(UserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);
        
        User::create($validated);
        return redirect()->route('admin.users.index')->with('success', 'User created.');
    }

    public function update(UserRequest $request, User $user)
    {
        $validated = $request->validated();
        
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        return redirect()->route('admin.users.index')->with('success', 'User updated.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'Cannot delete yourself.');
        }
        
        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User deleted.');
    }
}
