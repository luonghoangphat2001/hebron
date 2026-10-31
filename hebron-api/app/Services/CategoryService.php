<?php

namespace App\Services;

use App\Enums\UserAuthority;
use App\Models\Category;
use App\Models\Product;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository,
        protected ProductRepositoryInterface $productRepository,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get all categories
     */
    public function getAllCategories(array $options = []): Collection
    {
        return $this->categoryRepository->getAll($options);
    }

    /**
     * Get category details
     *
     * @throws \Exception
     */
    public function getCategoryDetails(string $slug): Category
    {
        $category = $this->categoryRepository->findWithRelations($slug, ['children', 'parent']);

        if (! $category) {
            throw new \Exception('카테고리를 찾을 수 없습니다.', 404);
        }

        return $category;
    }

    /**
     * Get children categories for a category
     *
     * @throws \Exception
     */
    public function getCategoryChildren(string $categorySlug): Collection
    {
        $category = $this->categoryRepository->findBySlug($categorySlug);

        if (! $category) {
            throw new \Exception('카테고리를 찾을 수 없습니다.', 404);
        }

        return $this->categoryRepository->getChildren($category->id);
    }

    /**
     * Get products for a category
     *
     * @throws \Exception
     */
    public function getCategoryProducts(string $categorySlug, array $filters = [], int $perPage = 15, ?UserAuthority $authority = null): array
    {
        // Find category
        $category = $this->categoryRepository->findBySlug($categorySlug);

        if (! $category) {
            throw new \Exception('카테고리를 찾을 수 없습니다.', 404);
        }

        // Check if category_ids filter is provided
        if (! empty($filters['category_ids'])) {
            $inputIds = is_array($filters['category_ids'])
                ? $filters['category_ids']
                : explode(',', $filters['category_ids']);
            $inputIds = array_values(array_unique(array_map('intval', $inputIds)));
            // Each selected category is an AND condition; descendants within
            // that category remain alternatives for matching the condition.
            $categoryIdGroups = array_map(
                fn (int $categoryId) => $this->getDescendantCategoryIds($categoryId),
                $inputIds
            );
        } elseif (! empty($filters['category_slugs'])) {
            $inputSlugs = is_array($filters['category_slugs'])
                ? $filters['category_slugs']
                : explode(',', $filters['category_slugs']);
            $inputSlugs = array_values(array_unique(array_map('trim', $inputSlugs)));
            $categoryIdsBySlug = Category::whereIn('slug', $inputSlugs)
                ->active()
                ->pluck('id', 'slug')
                ->all();
            $categoryIdGroups = [];

            foreach ($inputSlugs as $inputSlug) {
                if (isset($categoryIdsBySlug[$inputSlug])) {
                    $categoryIdGroups[] = $this->getDescendantCategoryIds($categoryIdsBySlug[$inputSlug]);
                }
            }
        } else {
            // Collect category + descendants
            $categoryIdGroups = [$this->getDescendantCategoryIds($category->id)];
        }

        $targetCategoryId = null;
        if (! empty($inputIds) && count($inputIds) === 1) {
            $targetCategoryId = (int) $inputIds[0];
        } elseif (! empty($categoryIdsBySlug) && count($categoryIdsBySlug) === 1) {
            $targetCategoryId = (int) reset($categoryIdsBySlug);
        } else {
            $targetCategoryId = (int) $category->id;
        }

        $categoryIds = empty($categoryIdGroups)
            ? []
            : array_values(array_unique(array_merge(...$categoryIdGroups)));
        $filters['category_id_groups'] = $categoryIdGroups;
        $filters['target_category_id'] = $targetCategoryId;

        // Get products across subtree
        $products = $this->productRepository->getByCategoryIds($categoryIds, $filters, $perPage, $authority);

        // Increment exposure count for all products in category results in bulk (avoid N+1 queries)
        $this->bulkIncrementExposureCount($products->items());

        return [
            'category' => $category,
            'products' => $products->items(),
            'pagination' => $this->paginationService->format($products),
        ];
    }

    /**
     * Get all descendant category IDs (including self)
     */
    private function getDescendantCategoryIds(int $categoryId): array
    {
        $ids = [$categoryId];
        $stack = [$categoryId];

        while (! empty($stack)) {
            $currentId = array_pop($stack);
            $children = Category::where('parent_id', $currentId)
                ->active()
                ->pluck('id')
                ->toArray();

            foreach ($children as $childId) {
                if (! in_array($childId, $ids, true)) {
                    $ids[] = $childId;
                    $stack[] = $childId;
                }
            }
        }

        return $ids;
    }

    /**
     * Get root categories (for menu)
     */
    public function getRootCategories(bool $withChildren = false): Collection
    {
        return $this->categoryRepository->getRootCategories($withChildren);
    }

    /**
     * Bulk increment exposure count for multiple products (avoid N+1 queries)
     *
     * @param  array|Collection  $products
     */
    private function bulkIncrementExposureCount($products): void
    {
        if (empty($products)) {
            return;
        }

        $productIds = collect($products)->pluck('id')->filter();

        if ($productIds->isNotEmpty()) {
            // Single database query to increment all exposure counts
            Product::whereIn('id', $productIds)->increment('exposure_count');
        }
    }
}
