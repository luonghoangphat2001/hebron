<?php

namespace App\Migration\Category\Importers;

use App\Migration\Category\DTO\CategoryImportData;
use App\Migration\Shared\Exceptions\CategoryImportException;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class CategoryImporter
{
    public function __construct() {}

    /**
     * Import a single category (idempotent via legacy_category_id).
     */
    public function import(CategoryImportData $dto): Category
    {
        $dryRun = (bool) config('migration.dry_run', false);

        if ($dryRun) {
            Log::info('[dry-run] CategoryImporter::import', [
                'legacy_id' => $dto->legacyId,
                'name' => $dto->name,
                'depth' => $dto->depth,
                'legacy_parent_id' => $dto->legacyParentId,
            ]);

            return new Category([
                'id' => 0,
                'legacy_category_id' => $dto->legacyId,
                'name' => $dto->name,
            ]);
        }

        try {
            return DB::transaction(function () use ($dto) {
                return $this->upsertCategory($dto);
            });
        } catch (Throwable $e) {
            Log::error('CategoryImporter: failed to import', [
                'legacy_id' => $dto->legacyId,
                'name' => $dto->name,
                'error' => $e->getMessage(),
            ]);
            throw new CategoryImportException(
                sprintf('Failed to import category %d (%s): %s', $dto->legacyId, $dto->name, $e->getMessage()),
                $dto->legacyId,
                $e,
            );
        }
    }

    protected function upsertCategory(CategoryImportData $dto): Category
    {
        $parentId = $this->resolveParentId($dto);

        $values = [
            'legacy_category_id' => $dto->legacyId,
            'parent_id' => $parentId,
            'name' => $dto->name,
            'name_en' => $dto->nameEn,
            'slug' => $this->ensureUniqueSlug($dto->slug, $dto->legacyId),
            'description' => null,
            'sort_order' => $dto->sortOrder,
            'exposure_order' => $dto->sortOrder,
            'is_active' => $dto->isActive
        ];

        $category = Category::updateOrCreate(
            ['legacy_category_id' => $dto->legacyId],
            $values,
        );

        Log::info('Category imported', [
            'legacy_id' => $dto->legacyId,
            'category_id' => $category->id,
            'name' => $category->name,
            'parent_id' => $category->parent_id,
        ]);

        return $category;
    }

    protected function resolveParentId(CategoryImportData $dto): ?int
    {
        if ($dto->legacyParentId <= 0) {
            return null;
        }

        $parentId = Category::where('legacy_category_id', $dto->legacyParentId)->value('id');

        if ($parentId === null) {
            Log::warning('CategoryImporter: parent not yet imported, linking as root', [
                'legacy_id' => $dto->legacyId,
                'legacy_parent_id' => $dto->legacyParentId,
            ]);
        }

        return $parentId ? (int) $parentId : null;
    }

    protected function ensureUniqueSlug(string $base, int $legacyId): string
    {
        $slug = Str::limit($base, 100, '');
        $candidate = $slug !== '' ? $slug : 'category-'.$legacyId;

        $original = $candidate;
        $i = 1;

        while (
            Category::withTrashed()
                ->where('slug', $candidate)
                ->where('legacy_category_id', '!=', $legacyId)
                ->exists()
        ) {
            $candidate = $original.'-'.(++$i);
        }

        return $candidate;
    }
}
