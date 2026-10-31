<?php

namespace App\Http\Resources;

use App\Support\TemplateAssetUrls;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplatePublicResource extends JsonResource
{
    /**
     * Convert file path to full URL (public /uploads/... or storage).
     */
    private static function toFullFileUrl(?string $path): ?string
    {
        return TemplateAssetUrls::url($path);
    }

    /**
     * FE editor expects layout_config.background.front_image_url/back_image_url,
     * while legacy data may use front/back. Normalize response to FE shape.
     *
     * @param  array<string, mixed>|null  $layoutConfig
     * @return array<string, mixed>|null
     */
    private static function normalizeLayoutConfigBackgroundKeys(?array $layoutConfig): ?array
    {
        if ($layoutConfig === null) {
            return null;
        }

        if (! isset($layoutConfig['background']) || ! is_array($layoutConfig['background'])) {
            return $layoutConfig;
        }

        $bg = $layoutConfig['background'];

        if (array_key_exists('front', $bg) && ! array_key_exists('front_image_url', $bg)) {
            $bg['front_image_url'] = $bg['front'];
        }
        if (array_key_exists('back', $bg) && ! array_key_exists('back_image_url', $bg)) {
            $bg['back_image_url'] = $bg['back'];
        }

        unset($bg['front'], $bg['back']);

        $layoutConfig['background'] = $bg;

        return $layoutConfig;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $layoutConfig = self::normalizeLayoutConfigBackgroundKeys($this->layout_config);
        $backgroundImageUrl = $this->relationLoaded('background') && $this->background
            ? self::toFullFileUrl($this->background->image_path)
            : null;
        if ($backgroundImageUrl !== null && $layoutConfig !== null) {
            $layoutConfig['background'] = array_merge(
                $layoutConfig['background'] ?? [],
                ['front_image_url' => $backgroundImageUrl],
            );
        }
        $frontPreview = self::toFullFileUrl($this->front_preview_url);
        $backPreview = self::toFullFileUrl($this->back_preview_url);
        $rawPreviewImages = $this->preview_images ?? [];
        $previewImages = is_array($rawPreviewImages)
            ? array_values(array_map(fn ($p) => self::toFullFileUrl((string) $p), $rawPreviewImages))
            : [];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'background_id' => $this->background_id,
            'background' => $this->whenLoaded('background', fn () => $this->background ? [
                'id' => $this->background->id,
                'image_url' => self::toFullFileUrl($this->background->image_path),
            ] : null),
            'size_option' => null,
            'product_id' => $this->product_id,
            'file_path' => self::toFullFileUrl($this->file_path),
            'specifications' => $this->specifications,
            'safety_line' => $this->safety_line,
            'cut_line' => $this->cut_line,
            'font_set' => $this->font_set,
            'color_set' => $this->color_set,
            'spot_color' => $this->spot_color,
            'layout_config' => TemplateAssetUrls::layout($layoutConfig),
            'front_preview_url' => $frontPreview,
            'back_preview_url' => $backPreview,
            'preview_images' => $previewImages,
        ];
    }
}
