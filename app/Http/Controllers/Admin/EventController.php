<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Http\Requests\EventRequest;
use App\Services\ImageUploadService;
use Inertia\Inertia;

class EventController extends Controller
{
    protected $imageUploadService;

    public function __construct(ImageUploadService $imageUploadService)
    {
        $this->imageUploadService = $imageUploadService;
    }

    public function index()
    {
        $events = Event::orderBy('sort_order')->get();
        return Inertia::render('Admin/Events/Index', [
            'events' => $events
        ]);
    }

    public function store(EventRequest $request)
    {
        $validated = $request->validated();
        
        if ($request->filled('image_url')) {
            $validated['image_url'] = $this->imageUploadService->handleImageUpload($validated['image_url']);
        }

        Event::create($validated);

        return redirect()->route('admin.events.index')->with('success', 'Event created.');
    }

    public function update(EventRequest $request, Event $event)
    {
        $validated = $request->validated();
        
        if ($request->filled('image_url') && $request->image_url !== $event->image_url) {
            $validated['image_url'] = $this->imageUploadService->handleImageUpload($validated['image_url']);
        }

        $event->update($validated);

        return redirect()->route('admin.events.index')->with('success', 'Event updated.');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return redirect()->route('admin.events.index')->with('success', 'Event deleted.');
    }
}
