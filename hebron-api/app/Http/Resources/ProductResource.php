<?php

namespace App\Http\Resources;

use App\Http\Resources\Admin\AdminFileResource;
use App\Models\File;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    /**
     * Convert image path to full URL.
     */
    private static function toFullImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));

        return $disk->url($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rawImages = $this->images ?? [];
        $images = is_array($rawImages)
            ? array_values(array_map(fn ($path) => self::toFullImageUrl((string) $path), $rawImages))
            : [];

        $fileAi = $this->resolveAiFiles($request);

        return [
            'id' => $this->id,
            'category_ids' => $this->whenLoaded(
                'categories',
                fn () => $this->categories->pluck('id')->values()
            ),
            'template_ids' => $this->whenLoaded(
                'templates',
                fn () => $this->templates->pluck('id')->values()
            ),
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            // Listing "~15,000원": price = min quantity_prices for default paper (paper_stock option with additional_price 0). Detail: + paper/coating/corner additional_price when selected.
            'supply_price' => $this->supply_price,
            'brand_site_price' => $this->brand_site_price,
            'plain_site_price' => $this->plain_site_price,
            'selling_price' => $this->selling_price,
            'shipping_fee' => $this->shipping_fee,
            'price_content' => $this->price_content,
            'sku' => $this->sku,
            'images' => $images,
            'first_image' => $images[0] ?? null,
            'file_ai' => $fileAi,
            'is_popular' => (bool) $this->is_popular,
            'is_featured' => (bool) $this->is_featured,
            'is_top_product' => (bool) $this->is_top_product,
            'stock_quantity' => $this->stock_quantity,
            'mes_inventory_enabled' => (bool) $this->mes_inventory_enabled,
            'stock_inventory_enabled' => (bool) $this->stock_inventory_enabled,
            'is_out_of_stock' => $this->isOutOfStock(),
            'min_quantity' => $this->min_quantity,
            'max_quantity' => $this->max_quantity,
            'has_option' => (bool) $this->has_option,
            'sort_order' => $this->sort_order,
            'visible_roles' => $this->visible_roles,
            'is_active' => (bool) $this->is_active,
            'view_count' => $this->view_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'categories' => CategoryResource::collection(
                $this->whenLoaded('categories')
            ),
            'specification' => $this->whenLoaded('specification', fn () => new ProductSpecificationResource($this->specification)),
            'option_groups' => ProductOptionGroupResource::collection($this->whenLoaded('optionGroups')),
            'templates' => $this->whenLoaded('templates', fn () => $this->templates->map(fn ($template) => [
                'id' => $template->id,
                'name' => $template->name,
                'is_active' => (bool) $template->is_active,
                'front_preview_url' => self::toFullImageUrl($template->front_preview_url),
            ])->values()),

            'has_discount' => $this->supply_price > $this->selling_price,
            'discount_percentage' => $this->supply_price > $this->selling_price
                ? round(($this->supply_price - $this->selling_price) / $this->supply_price * 100)
                : 0,
            'average_rating' => $this->average_rating,
            'total_reviews' => $this->total_reviews,
        ];
    }

    /**
     * Resolve normalized File ids into the public file response shape.
     *
     * @return array<int, mixed>
     */
    private function resolveAiFiles(Request $request): array
    {
        $references = array_values(array_filter(
            (array) ($this->file_ai ?? []),
            static fn ($reference) => $reference !== null && $reference !== ''
        ));

        if ($references === []) {
            return [];
        }

        $fileIds = array_values(array_filter($references, 'is_numeric'));
        $files = File::with('createdBy')->whereIn('id', $fileIds)->get();

        $filesById = $files->keyBy(fn (File $file) => (string) $file->id);

        return array_values(array_map(function ($reference) use ($filesById, $request): array {
            $referenceKey = (string) $reference;
            $file = $filesById->get($referenceKey);

            if ($file) {
                return (new AdminFileResource($file))->toArray($request);
            }

            throw new \UnexpectedValueException("Product AI file {$referenceKey} does not exist.");
        }, $references));
    }
}
