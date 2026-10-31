<?php

namespace App\Services\Admin;

use App\Constants\ProductStatusField;
use App\Enums\FileType;
use App\Models\Category;
use App\Models\File;
use App\Models\Product;
use App\Models\ProductSpecification;
use App\Models\Template;
use App\Services\PaginationService;
use App\Services\SortOrderService;
use App\Support\FileStorage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminProductService
{
    public function __construct(
        protected SortOrderService $sortOrderService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Default relationships to load with products
     *
     * @var array<string>
     */
    protected const DEFAULT_RELATIONSHIPS = [
        'categories',
        'specification',
        'optionGroups.options',
        'templates',
    ];

    /**
     * Convert URL/path references from the product API into File ids.
     * The public product payload uses file URLs; the database stores ids.
     *
     * @param  array<int, mixed>  $references
     * @return array<int, int>
     */
    protected function resolveAiFileReferences(array $references): array
    {
        return collect($references)
            ->filter(static fn ($reference) => is_string($reference) && trim($reference) !== '')
            ->map(function (string $reference): int {
                $reference = trim($reference);
                $file = File::query()
                    ->where('path', $reference)
                    ->orWhere('url', $reference)
                    ->first();

                if (! $file) {
                    $file = File::create([
                        'name' => basename(parse_url($reference, PHP_URL_PATH) ?: $reference),
                        'path' => $reference,
                        'url' => FileStorage::publicUrl($reference),
                        'type' => FileType::PRODUCT_AI->value,
                        'created_by' => auth()->id(),
                    ]);
                }

                return (int) $file->id;
            })
            ->values()
            ->all();
    }

    /**
     * Get search filter options for products.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'status_options' => [
                ['value' => 'sold', 'label' => 'Sold'],
                ['value' => 'hidden', 'label' => 'Hidden'],
            ],
            'promotional_options' => [
                ['value' => true, 'label' => 'Promotional'],
                ['value' => false, 'label' => 'Non-Promotional'],
            ],
            'availability_options' => [
                ['value' => 'in_stock', 'label' => 'In Stock'],
                ['value' => 'out_of_stock', 'label' => 'Sold Out'],
            ],
            'category_options' => Category::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($category) {
                    return [
                        'value' => $category->id,
                        'label' => $category->name,
                        'slug' => $category->slug,
                        'code' => $category->code,
                    ];
                })
                ->toArray(),
            'sort_options' => [
                ['value' => 'position', 'label' => 'Position'],
                ['value' => 'created_at', 'label' => 'Registration Date'],
                ['value' => 'status', 'label' => 'Status'],
                ['value' => 'category', 'label' => 'Category'],
                ['value' => 'name', 'label' => 'Product Name'],
            ],
        ];
    }

    /**
     * Get products for admin with filters
     *
     * @param  array<string, mixed>  $filters
     */
    public function getProductsForAdmin(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);

        // Apply sorting
        $sortBy = Arr::get($filters, 'sort_by', 'position');
        $sortOrder = Arr::get($filters, 'sort_order', $sortBy === 'position' ? 'asc' : 'desc');
        $sortColumn = $sortBy === 'sort_order' ? 'position' : $sortBy;
        $query->orderBy($sortColumn, $sortOrder);

        if ($sortColumn !== 'position') {
            $query->orderBy('position', 'asc');
        }

        $query->orderBy('id', 'asc');

        $currentPage = Arr::get($filters, 'current_page', 1);

        $products = $query->paginate(
            $perPage,
            ['*'],
            'page',
            $currentPage
        );

        return $products;
        $products = $query->paginate(
            $perPage,
            ['*'],
            'page',
            $currentPage
        );

        return $products;
    }

    /**
     * Build query with filters
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        // The admin list only needs table fields shown in the product table and
        // category labels. Detail relations are loaded by detail endpoints only.
        $rankedQuery = Product::query()
            ->select([
                'products.id',
                'products.name',
                'products.name_en',
                'products.sku',
                'products.images',
                'products.selling_price',
                'products.price_content',
                'products.stock_quantity',
                'products.is_active',
                'products.is_top_product',
                'products.mes_inventory_enabled',
                'products.stock_inventory_enabled',
                'products.created_at',
                'products.sort_order',
                'products.deleted_at',
                DB::raw('ROW_NUMBER() OVER (
                ORDER BY products.sort_order ASC, products.id ASC
            ) AS position'),
            ]);

        $query = Product::query()
            ->fromSub($rankedQuery, 'products')
            ->select([
                'products.id',
                'products.name',
                'products.name_en',
                'products.sku',
                'products.images',
                'products.selling_price',
                'products.price_content',
                'products.stock_quantity',
                'products.is_active',
                'products.is_top_product',
                'products.mes_inventory_enabled',
                'products.stock_inventory_enabled',
                'products.created_at',
                'products.position',
            ])->with(['categories:id,name,name_en,slug']);

        // Filter by product name
        if ($productName = Arr::get($filters, 'product_name')) {
            $query->where(function ($q) use ($productName) {
                $q->where('name', 'like', "%{$productName}%")
                    ->orWhere('name_en', 'like', "%{$productName}%");
            });
        }

        // Filter by product code (SKU)
        if ($productCode = Arr::get($filters, 'product_code')) {
            $query->where('sku', 'like', "%{$productCode}%");
        }

        // Filter by status (sold/hidden)
        if ($status = Arr::get($filters, 'status')) {
            if ($status === 'sold') {
                $query->where('is_active', true);
            } elseif ($status === 'hidden') {
                $query->where('is_active', false);
            }
        }

        // Filter by promotional use
        if (Arr::has($filters, 'is_promotional')) {
            $isPromotional = Arr::get($filters, 'is_promotional', false);
            // TODO: Add is_promotional field to products table if needed
            // For now, this might be determined by category or metadata
            // $query->where('is_promotional', $isPromotional);
        }

        // Filter products configured for the Shopping Mall Steady Seller section.
        if (Arr::has($filters, 'is_top_product')) {
            $query->where('is_top_product', Arr::get($filters, 'is_top_product'));
        }

        // Category filter - by ID
        if ($categoryId = Arr::get($filters, 'category_id')) {
            $query->whereHas('categories', function (Builder $q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        // Category filter - by name
        if ($categoryName = Arr::get($filters, 'category_name')) {
            $query->whereHas('categories', function (Builder $q) use ($categoryName) {
                $q->where('name', 'like', "%{$categoryName}%")
                    ->orWhere('name_en', 'like', "%{$categoryName}%");
            });
        }

        // Whether to disclose (공개여부) - maps to is_active
        if (Arr::has($filters, 'is_public')) {
            $isPublic = filter_var(Arr::get($filters, 'is_public'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isPublic !== null) {
                $query->where('is_active', $isPublic);
            }
        }

        // Availability (재고 상태): in_stock / out_of_stock
        if ($availability = Arr::get($filters, 'availability')) {
            if ($availability === 'in_stock') {
                $query->where('stock_quantity', '>', 0);
            } elseif ($availability === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0);
            }
        }

        // Search term (검색어) - product name, English name, product code
        // Search term (검색어) - product name, English name, product code
        if ($searchTerm = Arr::get($filters, 'search_term')) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('name_en', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        return $query;
    }

    /**
     * Get product relationships array
     *
     * @return array<string>
     */
    protected function getProductRelationships(): array
    {
        return self::DEFAULT_RELATIONSHIPS;
    }

    /**
     * Get a single product for admin by ID or slug
     *
     * @throws ModelNotFoundException
     */
    public function getProductForAdmin(int|string $identifier, bool $includeDeleted = false): Product
    {
        $query = Product::with($this->getProductRelationships());

        if ($includeDeleted) {
            $query->withTrashed();
        }

        if (is_numeric($identifier)) {
            $product = $query->find($identifier);
        } else {
            $product = $query->where('slug', $identifier)->first();
        }

        if (! $product) {
            throw new ModelNotFoundException('Product not found');
        }

        return $product;
    }

    /**
     * Create a new product with all relationships
     *
     * @param  array<string, mixed>  $data
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            // Generate slug if not provided
            $slug = Arr::get($data, 'slug');
            if (! $slug) {
                $slug = Str::slug($data['name']);
            }

            // Ensure unique slug
            $baseSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }

            // Create product
            $product = Product::create([
                'name' => $data['name'],
                'name_en' => Arr::get($data, 'name_en'),
                'slug' => $slug,
                'description' => Arr::get($data, 'description'),
                'short_description' => Arr::get($data, 'short_description'),
                'supply_price' => Arr::get($data, 'supply_price'),
                'brand_site_price' => $data['brand_site_price'],
                'plain_site_price' => $data['plain_site_price'],
                'shipping_fee' => $data['shipping_fee'],
                'price_content' => Arr::get($data, 'price_content'),
                'price_content' => Arr::get($data, 'price_content'),
                'selling_price' => $data['selling_price'],
                'sku' => Arr::get($data, 'sku'),
                'images' => Arr::get($data, 'images', []), // Representative image(s) – URLs set via CRUD (no upload)
                'file_ai' => $this->resolveAiFileReferences((array) Arr::get($data, 'file_ai', [])),
                'is_popular' => Arr::get($data, 'is_popular', false),
                'is_featured' => Arr::get($data, 'is_featured', false),
                'is_top_product' => Arr::get($data, 'is_top_product', false),
                'stock_quantity' => Arr::get($data, 'stock_quantity', 0),
                'min_quantity' => Arr::get($data, 'min_quantity', 1),
                'max_quantity' => Arr::get($data, 'max_quantity', 0),
                'has_option' => Arr::get($data, 'has_option', false),
                'visible_roles' => Arr::get($data, 'visible_roles'),
                'sort_order' => $this->sortOrderService->getNext(
                    new Product
                ),
                'mes_inventory_enabled' => Arr::get($data, 'mes_inventory_enabled', true),
                'stock_inventory_enabled' => Arr::get($data, 'stock_inventory_enabled', true),
                'is_active' => Arr::get($data, 'is_active', true),
            ]);

            if (Arr::has($data, 'category_ids') && is_array($data['category_ids'])) {
                $syncData = [];

                foreach ($data['category_ids'] as $index => $catId) {
                    $syncData[$catId] = [
                        'sort_order' => $index + 1,
                        'sort_order' => $index + 1,
                    ];
                }
                $product->categories()->sync($syncData);
            }

            // Create specification
            if (Arr::has($data, 'specification')) {
                $this->syncSpecification($product, $data['specification']);
            }

            if (Arr::has($data, 'option_group_ids')) {
                $this->syncOptionGroups($product, $data['option_group_ids']);
            }

            if (Arr::has($data, 'template_ids')) {
                $this->syncTemplates($product, $data['template_ids']);
            }

            if (Arr::has($data, 'template_ids')) {
                $this->syncTemplates($product, $data['template_ids']);
            }

            return $product->load($this->getProductRelationships());
        });
    }

    /**
     * Update a product
     *
     * @param  array<string, mixed>  $data
     *
     * @throws ModelNotFoundException
     */
    public function updateProduct(int|string $identifier, array $data): Product
    {
        return DB::transaction(function () use ($identifier, $data) {
            $product = $this->getProductForAdmin($identifier);

            // Update slug if provided and different
            if (Arr::has($data, 'slug') && $data['slug'] !== $product->slug) {
                $slug = $data['slug'];
                // Ensure unique slug
                $baseSlug = $slug;
                $counter = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $slug = $baseSlug.'-'.$counter;
                    $counter++;
                }
                $data['slug'] = $slug;
            }

            // Update product basic fields (representative image: images array of URLs via CRUD)
            $updateData = Arr::only($data, [
                'name',
                'legacy_product_id',
                'name_en',
                'slug',
                'description',
                'short_description',
                'selling_price',
                'selling_price',
                'brand_site_price',
                'plain_site_price',
                'supply_price',
                'shipping_fee',
                'price_content',
                'price_content',
                'sku',
                'images',
                'file_ai',
                'is_popular',
                'is_featured',
                'is_top_product',
                'stock_quantity',
                'min_quantity',
                'max_quantity',
                'has_option',
                'sort_order',
                'visible_roles',
                'mes_inventory_enabled',
                'stock_inventory_enabled',
                'is_active',
            ]);

            if (array_key_exists('file_ai', $updateData)) {
                $updateData['file_ai'] = $this->resolveAiFileReferences((array) $updateData['file_ai']);
            }

            $product->update($updateData);

            if (Arr::has($data, 'category_ids') && is_array($data['category_ids'])) {
                $syncData = [];
                foreach ($data['category_ids'] as $index => $catId) {
                    $syncData[$catId] = [
                        'sort_order' => $index + 1,
                        'sort_order' => $index + 1,
                    ];
                }
                $product->categories()->sync($syncData);
            }

            // Update specification
            if (Arr::has($data, 'specification')) {
                $this->syncSpecification($product, $data['specification']);
            }

            // Update option groups
            if (Arr::has($data, 'option_group_ids')) {
                $this->syncOptionGroups($product, $data['option_group_ids']);
            }

            if (Arr::has($data, 'template_ids')) {
                $this->syncTemplates($product, $data['template_ids']);
            }

            if (Arr::has($data, 'template_ids')) {
                $this->syncTemplates($product, $data['template_ids']);
            }

            return $product->fresh($this->getProductRelationships());
        });
    }

    /**
     * Assign the selected templates to the product and detach removed templates.
     * A template belongs to at most one product, so assigning it here transfers ownership.
     *
     * @param  array<int, int|string>  $templateIds
     */
    private function syncTemplates(Product $product, array $templateIds): void
    {
        $templateIds = collect($templateIds)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        Template::query()
            ->where('product_id', $product->id)
            ->when(
                $templateIds !== [],
                fn (Builder $query) => $query->whereNotIn('id', $templateIds)
            )
            ->update(['product_id' => null]);

        if ($templateIds !== []) {
            Template::query()
                ->whereIn('id', $templateIds)
                ->update(['product_id' => $product->id]);
        }
    }

    /**
     * Delete a product (soft delete)
     *
     * @throws ModelNotFoundException
     */
    public function deleteProduct(int|string $identifier): void
    {
        $product = $this->getProductForAdmin($identifier);
        $product->delete();
    }

    public function getProductCopyPreview(int|string $identifier): array
    {
        $product = $this->getProductForAdmin($identifier);

        $title = trim((string) $product->name);
        $defaultCopyTitle = $title === ''
            ? '복사('.$product->id.')'
            : $title.' 복사('.$product->id.')';

        return [
            'product_id' => (int) $product->id,
            'title' => $title,
            'default_copy_title' => $defaultCopyTitle,
        ];
    }

    public function copyProduct(int|string $identifier, string $copyTitle): Product
    {
        return DB::transaction(function () use ($identifier, $copyTitle) {
            $source = $this->getProductForAdmin($identifier);
            $source->loadMissing([]);

            $baseSlug = Str::slug($copyTitle);
            if ($baseSlug === '') {
                $baseSlug = 'product-copy-'.$source->id;
            }
            $slug = $this->ensureUniqueProductSlug($baseSlug);

            $clone = $source->replicate();
            $clone->name = trim($copyTitle);
            $clone->slug = $slug;
            $clone->sku = null;
            $clone->save();

            foreach ($source->templates as $template) {
                $replica = $template->replicate();
                $replica->product_id = $clone->id;
                $replica->save();
            }

            return $clone->fresh($this->getProductRelationships());
        });
    }

    private function ensureUniqueProductSlug(string $base): string
    {
        $slug = $base;
        $counter = 1;

        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Toggle product status field
     *
     * @throws ModelNotFoundException
     */
    public function toggleProductStatus(int|string $identifier, string $field, ?bool $value = null): Product
    {
        $product = $this->getProductForAdmin($identifier);

        $allowedFields = ProductStatusField::ALLOWED_FIELDS;
        if (! in_array($field, $allowedFields)) {
            throw new \InvalidArgumentException("Field '{$field}' is not allowed for toggling");
        }

        $product->update([
            $field => $value ?? ! $product->$field,
        ]);

        return $product->fresh($this->getProductRelationships());
    }

    /**
     * Bulk update product status
     *
     * @param  array<int>  $productIds
     * @return array<string, mixed>
     */
    public function bulkUpdateStatus(array $productIds, string $field, bool $value): array
    {
        $allowedFields = ProductStatusField::ALLOWED_FIELDS;
        if (! in_array($field, $allowedFields)) {
            throw new \InvalidArgumentException("Field '{$field}' is not allowed for bulk update");
        }

        $updated = Product::whereIn('id', $productIds)->update([$field => $value]);

        return [
            'updated_count' => $updated,
            'total_count' => count($productIds),
        ];
    }

    /**
     * Bulk delete products (soft delete)
     *
     * @param  array<int>  $productIds
     * @return array<string, mixed>
     */
    public function bulkDelete(array $productIds): array
    {
        $deleted = Product::whereIn('id', $productIds)->delete();

        return [
            'deleted_count' => $deleted,
            'total_count' => count($productIds),
        ];
    }

    /**
     * Bulk edit supported product fields (category_ids, selling_price,
     * stock_quantity, sort_order) for a list of product IDs.
     *
     * @param  array<int>  $productIds
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function bulkUpdate(array $productIds, array $data): array
    {
        $productIds = collect($productIds)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $scalars = [];
        if (array_key_exists('selling_price', $data)) {
            $scalars['selling_price'] = $data['selling_price'] === null
                ? null
                : (int) $data['selling_price'];
        }
        if (array_key_exists('stock_quantity', $data)) {
            $scalars['stock_quantity'] = (int) $data['stock_quantity'];
        }
        if (array_key_exists('sort_order', $data)) {
            $scalars['sort_order'] = (int) $data['sort_order'];
        }

        $updatedFields = [];
        $categoryCount = 0;

        return DB::transaction(function () use ($productIds, $scalars, $data, &$updatedFields, &$categoryCount) {
            if ($scalars !== []) {
                $updated = Product::whereIn('id', $productIds)->update($scalars);
                $updatedFields = array_keys($scalars);
            }

            if (array_key_exists('category_ids', $data) && is_array($data['category_ids'])) {
                $categoryIds = collect($data['category_ids'])
                    ->map(fn ($id) => (int) $id)
                    ->unique()
                    ->values()
                    ->all();

                foreach ($productIds as $productId) {
                    $syncData = [];
                    foreach ($categoryIds as $index => $catId) {
                        $syncData[$catId] = ['sort_order' => $index + 1];
                    }
                    Product::find($productId)?->categories()->sync($syncData);
                    $categoryCount++;
                }

                $updatedFields[] = 'category_ids';
            }

            return [
                'updated_count' => count($productIds),
                'total_count' => count($productIds),
                'updated_fields' => array_values(array_unique($updatedFields)),
                'category_count' => $categoryCount,
            ];
        });
    }

    /**
     * Sync product specification
     *
     * @param  array<string, mixed>  $specData
     */
    protected function syncSpecification(Product $product, array $specData): void
    {
        ProductSpecification::updateOrCreate(
            ['product_id' => $product->id],
            $specData
        );
    }

    /**
     * Sync product option groups
     *
     * @param  array<int, array<string, mixed>>  $optionGroupsData
     */
    protected function syncOptionGroups(Product $product, array $optionGroupsData): void
    {
        $syncData = [];
        foreach ($optionGroupsData as $index => $group) {
            $id = $group['id'] ?? $group;
            $syncData[$id] = [
                'sort_order' => $index + 1,
            ];
        }
        $product->optionGroups()->sync($syncData);
    }
}
