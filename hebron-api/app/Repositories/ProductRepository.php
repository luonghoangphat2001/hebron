<?php

namespace App\Repositories;

use App\Enums\ProductSortField;
use App\Enums\ProductVisibleRole;
use App\Enums\UserAuthority;
use App\Models\Category;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Get paginated products with optional filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): LengthAwarePaginator
    {
        // Keep this projection in sync with ProductListResource. Exclude large
        // detail content and counters that are not displayed in product lists.
        $query = Product::select([
            'products.id',
            'products.name',
            'products.name_en',
            'products.slug',
            'products.supply_price',
            'products.selling_price',
            'products.brand_site_price',
            'products.plain_site_price',
            'products.price_content',
            'products.sku',
            'products.images',
            'products.is_popular',
            'products.is_featured',
            'products.is_top_product',
            'products.is_active',
            'products.sort_order',
            'products.average_rating',
            'products.total_reviews',
            'products.created_at',
            DB::raw('ROW_NUMBER() OVER (
                ORDER BY products.sort_order ASC, products.id ASC
            ) AS position'),
        ])
            ->with(['categories:id,name,name_en,slug,is_active'])
            ->active();

        $this->applyVisibleRolesFilter($query, $authority);

        // Apply category filter - support both category_id and category_ids (many-to-many)
        if (isset($filters['category_id'])) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $filters['category_id']));
        }

        if (! empty($filters['category_ids']) && is_array($filters['category_ids'])) {
            $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $filters['category_ids']));
        }

        // Listing search must not scan the large HTML `description` column.
        // `paginate()` executes both a COUNT query and a data query, so an
        // unindexed LIKE against MEDIUMTEXT here makes short searches very slow.
        $query->searchList($filters['q'] ?? null);

        if (is_numeric($filters['selling_price_from'] ?? null)) {
            $query->where('products.selling_price', '>=', (float) $filters['selling_price_from']);
        }

        if (is_numeric($filters['selling_price_to'] ?? null)) {
            $query->where('products.selling_price', '<=', (float) $filters['selling_price_to']);
        }

        if (($filters['is_popular'] ?? null) !== null) {
            $query->where('products.is_popular', $filters['is_popular']);
        }

        if (($filters['is_featured'] ?? null) !== null) {
            $query->where('products.is_featured', $filters['is_featured']);
        }

        if (($filters['is_top_product'] ?? null) !== null) {
            $query->where('products.is_top_product', $filters['is_top_product']);
        }

        if (($filters['availability'] ?? null) === 'in_stock') {
            $query->where(function ($q) {
                $q->where('products.stock_inventory_enabled', false)
                    ->orWhere('products.stock_quantity', '>', 0);
            });
        } elseif (($filters['availability'] ?? null) === 'out_of_stock') {
            $query->where('products.stock_inventory_enabled', true)
                ->where('products.stock_quantity', '<=', 0);
        }

        $this->applySorting($query, $filters['sort_by'] ?? null, $filters['sort_order'] ?? null);

        return $query->paginate($perPage);
    }

    /**
     * Find product by slug
     */
    public function findBySlug(string $slug, ?UserAuthority $authority = null): ?Product
    {
        $query = Product::query()
            ->select($this->detailColumns())
            ->with($this->detailRelations())
            ->where('slug', $slug)
            ->active();

        $this->applyVisibleRolesFilter($query, $authority);

        return $query->first();
    }

    /**
     * Get popular products
     */
    public function getPopular(int $limit = 10, ?UserAuthority $authority = null): Collection
    {
        $query = Product::with($this->listRelations())
            ->popular();

        $this->applyVisibleRolesFilter($query, $authority);

        return $query
            ->orderBy('view_count', 'desc')
            ->orderBy('sort_order', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search products by keyword
     */
    public function search(string $keyword, array $filters = [], int $perPage = 15, bool $includeChildCategory = false, ?UserAuthority $authority = null): LengthAwarePaginator
    {
        $keyword = trim($keyword);
        $query = Product::select($this->getSearchColumns())
            ->active()
            ->searchList($keyword);

        $this->applySearchRanking($query, $keyword);

        $this->applyVisibleRolesFilter($query, $authority);

        // Apply category filter - support both category_id and category_ids (many-to-many)
        if (isset($filters['category_id'])) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $filters['category_id']));
        }

        if (! empty($filters['category_ids']) && is_array($filters['category_ids'])) {
            if ($includeChildCategory) {
                $categoryIds = $this->getWithChildCategoryIds($filters['category_ids']);
                $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $categoryIds));
            } else {
                $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $filters['category_ids']));
            }
        }

        if (is_numeric($filters['selling_price_from'] ?? null)) {
            $query->where('products.selling_price', '>=', (float) $filters['selling_price_from']);
        }

        if (is_numeric($filters['selling_price_to'] ?? null)) {
            $query->where('products.selling_price', '<=', (float) $filters['selling_price_to']);
        }

        if (($filters['is_popular'] ?? null) !== null) {
            $query->where('products.is_popular', $filters['is_popular']);
        }

        if (($filters['is_featured'] ?? null) !== null) {
            $query->where('products.is_featured', $filters['is_featured']);
        }

        if (($filters['is_top_product'] ?? null) !== null) {
            $query->where('products.is_top_product', $filters['is_top_product']);
        }

        if (is_numeric($filters['exclude_id'] ?? null)) {
            $query->where('products.id', '!=', (int) $filters['exclude_id']);
        }

        // Exact SKU/name matches rank ahead of partial matches. A user-selected
        // sort is applied only between equally relevant search results.
        if ($keyword !== '') {
            $query->orderByDesc('search_exact_rank');
        }

        $this->applySorting($query, $filters['sort_by'] ?? null, $filters['sort_order'] ?? null);

        return $query->paginate($perPage);
    }

    /**
     * Increment view count for a product
     */
    public function incrementViewCount(Product $product): void
    {
        $product->incrementViewCount();
    }

    /**
     * Increment exposure count for a product
     */
    public function incrementExposureCount(Product $product): void
    {
        $product->incrementExposureCount();
    }

    /**
     * Get products by category
     */
    public function getByCategory(int $categoryId, array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): LengthAwarePaginator
    {
        $query = Product::with($this->listRelations())
            ->whereHas('categories', fn ($q) => $q->where('categories.id', $categoryId))
            ->where('is_active', true);

        $this->applyVisibleRolesFilter($query, $authority);

        $this->applySorting($query, $filters['sort_by'] ?? null, $filters['sort_order'] ?? null);

        return $query->paginate($perPage);
    }

    /**
     * Get products by multiple category IDs
     */
    public function getByCategoryIds(array $categoryIds, array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): LengthAwarePaginator
    {
        $targetCategoryId = (int) ($filters['target_category_id'] ?? ($categoryIds[0] ?? 0));

        $categoryPositions = DB::table('category_product')
            ->select([
                'product_id',
                DB::raw("MAX(CASE WHEN category_id = {$targetCategoryId} THEN 1 ELSE 0 END) AS is_direct"),
                DB::raw("
                    CASE 
                        WHEN MAX(CASE WHEN category_id = {$targetCategoryId} THEN 1 ELSE 0 END) = 1 
                        THEN MIN(CASE WHEN category_id = {$targetCategoryId} THEN sort_order ELSE NULL END)
                        ELSE MIN(sort_order) 
                    END AS category_position
                "),
            ])
            ->whereIn('category_id', $categoryIds)
            ->whereNull('deleted_at')
            ->groupBy('product_id');

        $query = Product::select([
            'products.id',
            'products.name',
            'products.name_en',
            'products.slug',
            'products.supply_price',
            'products.brand_site_price',
            'products.plain_site_price',
            'products.selling_price',
            'products.shipping_fee',
            'products.price_content',
            'products.sku',
            'products.images',
            'products.is_popular',
            'products.is_featured',
            'products.is_active',
            'products.sort_order',
            'products.average_rating',
            'products.total_reviews',
            'products.created_at',
            'category_positions.category_position',
            'category_positions.is_direct',
            DB::raw('ROW_NUMBER() OVER (
                ORDER BY category_positions.is_direct DESC, category_positions.category_position ASC, products.id ASC
            ) AS position'),
        ])
            ->joinSub($categoryPositions, 'category_positions', function ($join) {
                $join->on('category_positions.product_id', '=', 'products.id');
            })
            ->with(['categories:id'])
            ->where('is_active', true);

        $categoryIdGroups = $filters['category_id_groups'] ?? [$categoryIds];
        foreach ($categoryIdGroups as $categoryIdGroup) {
            $query->whereHas(
                'categories',
                fn ($q) => $q->whereIn('categories.id', $categoryIdGroup)
            );
        }

        $this->applyVisibleRolesFilter($query, $authority);

        if (filled($filters['search'] ?? null)) {
            $query->where('products.name', 'like', '%'.$filters['search'].'%');
        }

        if (is_numeric($filters['selling_price_from'] ?? null)) {
            $query->where('selling_price', '>=', (float) $filters['selling_price_from']);
        }

        if (is_numeric($filters['selling_price_to'] ?? null)) {
            $query->where('selling_price', '<=', (float) $filters['selling_price_to']);
        }

        if (($filters['is_popular'] ?? null) !== null) {
            $query->where('products.is_popular', $filters['is_popular']);
        }

        if (($filters['is_featured'] ?? null) !== null) {
            $query->where('products.is_featured', $filters['is_featured']);
        }

        // Category listings use the position stored on category_product.
        $sortBy = $filters['sort_by'] ?? ProductSortField::POSITION->value;
        $sortDirection = $this->validateSortDirection($filters['sort_order'] ?? null, $sortBy);

        if (in_array($sortBy, [
            ProductSortField::POSITION->value,
            ProductSortField::SORT_ORDER->value,
        ], true)) {
            $query->orderByDesc('category_positions.is_direct')
                ->orderBy('category_positions.category_position', $sortDirection)
                ->orderBy('products.id', 'asc');
        } else {
            $sortField = $this->validateSortField($sortBy);

            $query->orderBy($sortField, $sortDirection);

            if (! in_array($sortBy, [
                ProductSortField::CREATED_AT->value,
                ProductSortField::VIEW_COUNT->value,
                'latest',
                'newest',
            ], true)) {
                $query->orderByDesc('category_positions.is_direct')
                    ->orderBy('category_positions.category_position', 'asc');
            }

            $query->orderBy('products.id', 'asc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Apply the products.visible_roles filter based on the current user's
     * authority. `visible_roles` is stored as a JSON array on each product.
     *
     * - normal_user: products whose visible_roles is null, contains "ALL",
     *   or contains "MEMBER".
     * - store_admin: also includes products containing "MANAGER".
     * - super_admin (and null): no extra restriction.
     */
    private function applyVisibleRolesFilter(Builder $query, ?UserAuthority $authority): void
    {
        if ($authority === UserAuthority::SUPER_ADMIN) {
            return;
        }

        $allowedRoles = [ProductVisibleRole::ALL->value, ProductVisibleRole::MEMBER->value];

        if ($authority === UserAuthority::STORE_ADMIN) {
            $allowedRoles[] = ProductVisibleRole::MANAGER->value;
        }

        $query->where(function (Builder $q) use ($allowedRoles) {
            $q->whereNull('products.visible_roles');

            foreach ($allowedRoles as $role) {
                $q->orWhereJsonContains('products.visible_roles', $role);
            }
        });
    }

    private function applySorting(Builder $query, ?string $sortBy, ?string $sortOrder): void
    {
        $sortField = $this->validateSortField($sortBy);
        $sortDirection = $this->validateSortDirection($sortOrder, $sortBy);

        $query->orderBy($sortField, $sortDirection);

        if ($sortField !== 'products.sort_order') {
            $query->orderBy('products.sort_order', 'asc');
        }

        $query->orderBy('products.id', 'asc');
    }

    /**
     * Validate and return safe sort field
     */
    private function validateSortField(?string $field): string
    {
        // `price` is the public API value, while the products table stores it
        // as `selling_price`. Always return a real, qualified DB column.
        return match ($field) {
            ProductSortField::NAME->value => 'products.name',
            ProductSortField::PRICE->value, 'selling_price', 'price_asc', 'price_desc' => 'products.selling_price',
            ProductSortField::CREATED_AT->value, 'latest', 'newest' => 'products.created_at',
            'name_asc' => 'products.name',
            'popular' => 'products.is_popular',
            ProductSortField::VIEW_COUNT->value => 'products.view_count',
            ProductSortField::SORT_ORDER->value, ProductSortField::POSITION->value => 'products.sort_order',
            default => 'products.sort_order',
        };
    }

    /**
     * Validate and return safe sort direction
     */
    private function validateSortDirection(?string $direction, ?string $field = null): string
    {
        if (in_array(strtolower($direction ?? ''), ['asc', 'desc'], true)) {
            return strtolower($direction);
        }

        return in_array($field, [
            ProductSortField::CREATED_AT->value,
            'latest',
            'newest',
        ], true) ? 'desc' : match ($field) {
            'price_desc', 'popular', ProductSortField::VIEW_COUNT->value => 'desc',
            default => 'asc',
        };
    }

    /**
     * Get category IDs including child categories
     */
    private function getWithChildCategoryIds(array $categoryIds): array
    {
        $allIds = $categoryIds;
        $categories = Category::whereIn('id', $categoryIds)->get();

        foreach ($categories as $category) {
            $childIds = Category::where('parent_id', $category->id)
                ->where('is_active', true)
                ->pluck('id')
                ->toArray();
            $allIds = array_merge($allIds, $childIds);
        }

        return array_unique($allIds);
    }

    private function listRelations(): array
    {
        return ['categories'];
    }

    private function getSearchColumns(): array
    {
        return [
            'products.id',
            'products.name',
            'products.name_en',
            'products.slug',
            'products.sku',
            'products.supply_price',
            'products.selling_price',
            'products.brand_site_price',
            'products.plain_site_price',
            'products.price_content',
            'products.images',
            'products.is_popular',
            'products.is_featured',
            'products.is_top_product',
            'products.is_active',
            'products.sort_order',
            'products.average_rating',
            'products.total_reviews',
            'products.created_at',
        ];
    }

    private function applySearchRanking(Builder $query, string $keyword): void
    {
        if ($keyword === '') {
            return;
        }

        $contains = '%'.addcslashes($keyword, '\\%_').'%';

        $query->selectRaw(
            'CASE
                WHEN products.sku = ? THEN 4
                WHEN products.name = ? OR products.name_en = ? THEN 3
                WHEN products.name LIKE ? OR products.name_en LIKE ? THEN 2
                WHEN products.sku LIKE ? THEN 1
                ELSE 0
            END AS search_exact_rank',
            [$keyword, $keyword, $keyword, $contains, $contains, $contains]
        );
    }

    /** @return array<int, string> */
    private function detailColumns(): array
    {
        return [
            'products.id',
            'products.name',
            'products.name_en',
            'products.slug',
            'products.description',
            'products.short_description',
            'products.supply_price',
            'products.brand_site_price',
            'products.plain_site_price',
            'products.selling_price',
            'products.price_content',
            'products.shipping_fee',
            'products.sku',
            'products.images',
            'products.file_ai',
            'products.is_popular',
            'products.is_featured',
            'products.stock_quantity',
            'products.mes_inventory_enabled',
            'products.stock_inventory_enabled',
            'products.min_quantity',
            'products.max_quantity',
            'products.has_option',
            'products.sort_order',
            'products.visible_roles',
            'products.is_active',
            'products.view_count',
            'products.average_rating',
            'products.total_reviews',
            'products.created_at',
            'products.updated_at',
            'products.deleted_at',
        ];
    }

    /** @return array<string, \Closure> */
    private function detailRelations(): array
    {
        return [
            'categories' => fn ($query) => $query->select([
                'categories.id',
                'categories.parent_id',
                'categories.name',
                'categories.name_en',
                'categories.slug',
                'categories.description',
                'categories.subtitle',
                'categories.image',
                'categories.icon',
                'categories.sort_order',
                'categories.is_active',
                'categories.created_at',
                'categories.updated_at',
            ]),
            'specification' => fn ($query) => $query->select([
                'product_specifications.id',
                'product_specifications.product_id',
                'product_specifications.size',
                'product_specifications.materials',
                'product_specifications.case',
                'product_specifications.product_period',
                'product_specifications.total_product_amount',
                'product_specifications.shipping_info',
                'product_specifications.weight',
                'product_specifications.notes',
            ]),
            'optionGroups' => fn ($query) => $query->select([
                'product_option_groups.id',
                'product_option_groups.code',
                'product_option_groups.name',
                'product_option_groups.display_type',
                'product_option_groups.is_required',
            ]),
            'optionGroups.options' => fn ($query) => $query->select([
                'product_options.id',
                'product_options.option_group_id',
                'product_options.name',
                'product_options.additional_price',
                'product_options.additional_brand_site_price',
                'product_options.additional_plain_site_price',
                'product_options.metadata',
                'product_options.sort_order',
            ]),
        ];
    }
}
