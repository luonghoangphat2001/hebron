<?php

namespace App\Repositories\Contracts;

use App\Enums\UserAuthority;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    /**
     * Get paginated products with optional filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): LengthAwarePaginator;

    /**
     * Find product by slug
     */
    public function findBySlug(string $slug, ?UserAuthority $authority = null): ?Product;

    /**
     * Get popular products
     */
    public function getPopular(int $limit = 10, ?UserAuthority $authority = null): Collection;

    /**
     * Search products by keyword
     */
    public function search(string $keyword, array $filters = [], int $perPage = 15, bool $includeChildCategory = false, ?UserAuthority $authority = null): LengthAwarePaginator;

    /**
     * Increment view count for a product
     */
    public function incrementViewCount(Product $product): void;

    /**
     * Increment exposure count for a product
     */
    public function incrementExposureCount(Product $product): void;

    /**
     * Get products by category
     */
    public function getByCategory(int $categoryId, array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): LengthAwarePaginator;

    /**
     * Get products by multiple category IDs
     */
    public function getByCategoryIds(array $categoryIds, array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): LengthAwarePaginator;
}
