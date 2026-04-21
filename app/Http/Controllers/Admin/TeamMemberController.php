<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Http\Requests\TeamMemberRequest;
use App\Services\ImageUploadService;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    protected $imageUploadService;

    public function __construct(ImageUploadService $imageUploadService)
    {
        $this->imageUploadService = $imageUploadService;
    }

    public function index()
    {
        $team = TeamMember::orderBy('sort_order')->get();
        return Inertia::render('Admin/Team/Index', [
            'team' => $team
        ]);
    }

    public function store(TeamMemberRequest $request)
    {
        $validated = $request->validated();
        if ($request->filled('image_url')) {
            $validated['image_url'] = $this->imageUploadService->handleImageUpload($validated['image_url']);
        }

        TeamMember::create($validated);
        return redirect()->route('admin.team.index')->with('success', 'Member created.');
    }

    public function update(TeamMemberRequest $request, TeamMember $team)
    {
        $validated = $request->validated();
        if ($request->filled('image_url') && $request->image_url !== $team->image_url) {
            $validated['image_url'] = $this->imageUploadService->handleImageUpload($validated['image_url']);
        }

        $team->update($validated);
        return redirect()->route('admin.team.index')->with('success', 'Member updated.');
    }

    public function destroy(TeamMember $team)
    {
        $team->delete();
        return redirect()->route('admin.team.index')->with('success', 'Member deleted.');
    }
}
