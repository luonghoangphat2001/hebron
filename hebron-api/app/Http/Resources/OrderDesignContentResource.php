<?php

namespace App\Http\Resources;

use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDesignContentResource extends JsonResource
{
    private static function publicAttachmentUrl(string $filePath): string
    {
        $path = $filePath;

        if (str_starts_with($filePath, 'http://') || str_starts_with($filePath, 'https://')) {
            $urlPath = parse_url($filePath, PHP_URL_PATH);
            $path = is_string($urlPath) ? ltrim(rawurldecode($urlPath), '/') : $filePath;
        }

        return FileStorage::publicUrl($path) ?? $filePath;
    }

    private static function attachmentForResponse(mixed $attachment): mixed
    {
        if (! is_array($attachment) || ! is_string($attachment['file_path'] ?? null)) {
            return $attachment;
        }

        $attachment['file_path'] = self::publicAttachmentUrl($attachment['file_path']);

        return $attachment;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'recipient_name' => $this->recipient_name,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'main_text' => $this->main_text,
            'sender_name' => $this->sender_name,
            'attachment_file_urls' => collect($this->attachment_file_urls ?? [])
                ->map(fn (mixed $attachment): mixed => self::attachmentForResponse($attachment))
                ->values()
                ->all(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
