<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Http\Requests\GalleryRequest;
use App\Services\ImageUploadService;
use Inertia\Inertia;

class GalleryController extends Controller
{
    protected $imageUploadService;

    public function __construct(ImageUploadService $imageUploadService)
    {
        $this->imageUploadService = $imageUploadService;
    }

    public function index()
    {
        $gallery = Gallery::orderBy('sort_order')->get();
        return Inertia::render('Admin/Gallery/Index', [
            'gallery' => $gallery
        ]);
    }

    public function store(GalleryRequest $request)
    {
        $validated = $request->validated();
        if ($request->filled('image_url')) {
            $validated['image_url'] = $this->imageUploadService->handleImageUpload($validated['image_url']);
        }

        Gallery::create($validated);
        return redirect()->route('admin.gallery.index')->with('success', 'Image created.');
    }

    public function update(GalleryRequest $request, Gallery $gallery)
    {
        $validated = $request->validated();
        if ($request->filled('image_url') && $request->image_url !== $gallery->image_url) {
            $validated['image_url'] = $this->imageUploadService->handleImageUpload($validated['image_url']);
        }

        $gallery->update($validated);
        return redirect()->route('admin.gallery.index')->with('success', 'Image updated.');
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();
        return redirect()->route('admin.gallery.index')->with('success', 'Image deleted.');
    }
}
