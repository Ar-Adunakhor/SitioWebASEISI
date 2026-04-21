<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Committee;
use App\Models\User;
use App\Http\Requests\CommitteeRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CommitteeController extends Controller
{
    public function index()
    {
        $committees = Committee::with('users:id,name,email')->orderBy('name')->get();
        $all_users = User::orderBy('name')->get(['id', 'name', 'email']);
        
        return Inertia::render('Admin/Committees/Index', [
            'committees' => $committees,
            'all_users' => $all_users
        ]);
    }

    public function store(CommitteeRequest $request)
    {
        Committee::create($request->validated());
        return redirect()->route('admin.committees.index')->with('success', 'Committee created.');
    }

    public function update(CommitteeRequest $request, Committee $committee)
    {
        $committee->update($request->validated());
        return redirect()->route('admin.committees.index')->with('success', 'Committee updated.');
    }

    public function destroy(Committee $committee)
    {
        $committee->delete();
        return redirect()->route('admin.committees.index')->with('success', 'Committee deleted.');
    }

    public function addMember(Request $request, Committee $committee)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);
        
        if (!$committee->users()->where('user_id', $request->user_id)->exists()) {
            $committee->users()->attach($request->user_id);
        }
        
        return redirect()->back()->with('success', 'Member added.');
    }

    public function removeMember(Committee $committee, User $user)
    {
        $committee->users()->detach($user->id);
        return redirect()->back()->with('success', 'Member removed.');
    }
}
