<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    /**
     * Store a base64 encoded image or return the existing path.
     *
     * @param string|null $imageData Base64 image data or URL
     * @return string|null Path to the saved image
     */
    public function handleImageUpload(?string $imageData): ?string
    {
        if (empty($imageData)) {
            return null;
        }

        // If it's already an uploaded file path, return it
        if (!Str::startsWith($imageData, 'data:image')) {
            return $imageData;
        }

        // Parse base64
        @list($type, $file_data) = explode(';', $imageData);
        @list(, $file_data) = explode(',', $file_data);

        // Get extension
        $extension = 'jpg';
        if (Str::contains($type, 'png')) $extension = 'png';
        if (Str::contains($type, 'webp')) $extension = 'webp';
        if (Str::contains($type, 'gif')) $extension = 'gif';
        if (Str::contains($type, 'svg')) $extension = 'svg';

        $filename = 'uploads/' . Str::random(12) . '.' . $extension;

        Storage::disk('public')->put($filename, base64_decode($file_data));

        return $filename;
    }
}
