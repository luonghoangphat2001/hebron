<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    /**
     * Get all categories with optional filters
     */
    public function getAll(array $options = []): Collection
    {
        $query = Category::active()->orderBy('sort_order', 'asc');

        // Load children recursively if requested
        if ($options['with_children'] ?? false) {
            $query->with('childrenRecursive');
        }

        // Filter to root categories only if requested
        if ($options['root_only'] ?? true) {
            $query->root();
        }

        return $query->get();
    }

    /**
     * Find category by slug
     */
    public function findBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)
            ->active()
            ->first();
    }

    /**
     * Get root categories (no parent)
     */
    public function getRootCategories(bool $withChildren = false): Collection
    {
        $query = Category::active()
            ->root()
            ->orderBy('sort_order', 'asc');

        if ($withChildren) {
            $query->with('childrenRecursive');
        }

        return $query->get();
    }

    /**
     * Get category with relationships
     */
    public function findWithRelations(string $slug, array $with = []): ?Category
    {
        $query = Category::where('slug', $slug)->active();

        if (! empty($with)) {
            $query->with($with);
        }

        return $query->first();
    }

    /**
     * Get children categories for a given parent ID
     */
    public function getChildren(int $parentId): Collection
    {
        return Category::active()
            ->where('parent_id', $parentId)
            ->withCount('products')
            ->withExists('children')
            ->with(['children' => function ($query) {
                $query->withCount('products');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();
    }
}
