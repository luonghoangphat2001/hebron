<?php

namespace App\Http\Resources\Admin;

use App\Enums\UsageStatusValue;
use App\Support\TemplateAssetUrls;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTemplateResource extends JsonResource
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

        // If legacy keys exist, map them to FE keys.
        if (array_key_exists('front', $bg) && ! array_key_exists('front_image_url', $bg)) {
            $bg['front_image_url'] = $bg['front'];
        }
        if (array_key_exists('back', $bg) && ! array_key_exists('back_image_url', $bg)) {
            $bg['back_image_url'] = $bg['back'];
        }

        // Remove legacy keys to avoid confusion.
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
        $statusEnum = $this->is_active ? UsageStatusValue::ACTIVE : UsageStatusValue::INACTIVE;

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
                'image_path' => $this->background->image_path,
                'image_url' => self::toFullFileUrl($this->background->image_path),
            ] : null),
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'sku' => $this->product->sku,
                ];
            }),
            'product_id' => $this->product_id,
            'size_option_id' => $this->size_option_id,
            'size_option' => $this->whenLoaded('sizeOption', function () {
                return [
                    'id' => $this->sizeOption->id,
                    'name' => $this->sizeOption->name,
                    'cutting_width' => $this->sizeOption->cutting_width,
                    'cutting_height' => $this->sizeOption->cutting_height,
                    'working_width' => $this->sizeOption->working_width,
                    'working_height' => $this->sizeOption->working_height,
                    'size_ratio' => $this->sizeOption->size_ratio,
                ];
            }),
            'specifications' => $this->specifications,
            'file_path' => self::toFullFileUrl($this->file_path),
            'safety_line' => $this->safety_line,
            'cut_line' => $this->cut_line,
            'font_set' => $this->font_set,
            'color_set' => $this->color_set,
            'spot_color' => $this->spot_color,
            'layout_config' => TemplateAssetUrls::layout($layoutConfig),
            'editor_permission' => $this->editor_permission,
            'front_preview_url' => $frontPreview,
            'back_preview_url' => $backPreview,
            'preview_images' => $previewImages,
            'status' => [
                'value' => $statusEnum->value,
                'label' => $statusEnum->label(),
            ],
            'is_active' => $this->is_active,
            'registrant' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'editor_size_ids' => $this->whenLoaded('editorSizes', function () {
                return $this->editorSizes->pluck('id');
            }),
        ];
    }
}
