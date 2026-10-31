<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminProductOptionDetailResource;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Services\PaginationService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminProductOptionService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function getProductOptions(array $filters, int $perPage = 20): array
    {
        $query = ProductOption::query()->with(['group', 'deletedByUser']);

        $optionGroupId = Arr::get($filters, 'option_group_id');
        $name = Arr::get($filters, 'name');
        $isActive = Arr::get($filters, 'is_active');
        if ($optionGroupId) {
            $query->where('option_group_id', $optionGroupId);
        }

        if ($name) {
            $query->where('name', 'like', '%'.$name.'%');
        }

        if ($isActive !== null) {
            $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = Arr::get($filters, 'sort_by', 'sort_order');
        $sortOrder = Arr::get($filters, 'sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $productOption = $query->paginate($perPage);
        return [
            'product_options' => AdminProductOptionDetailResource::collection($productOption->items()),
            'pagination' => $this->paginationService->format($productOption),
        ];
    }

    public function getProductOption(int $id): ProductOption
    {
        return ProductOption::with(['group', 'deletedByUser'])->findOrFail($id);
    }

    public function createProductOption(array $data): ProductOption
    {
        return DB::transaction(function () use ($data) {
            $group = ProductOptionGroup::find($data['option_group_id']);
            if (! $group) {
                throw new \Exception('Option group not found.', 422);
            }

            $existingOption = ProductOption::withTrashed()
                ->where('option_group_id', $data['option_group_id'])
                ->where('name', $data['name'])
                ->first();

            if ($existingOption) {
                if ($existingOption->deleted_at === null) {
                    throw new \Exception('Option name already exists in this group.', 422);
                }
                if (! $this->canRestore($existingOption)) {
                    throw new \Exception('Cannot create option with duplicate soft-deleted name.', 422);
                }

                $existingOption->restore();
                $existingOption->update([
                    'category' => $data['category'] ?? null,
                    'name' => $data['name'],
                    'additional_price' => $data['additional_price'] ?? 0,
                    'additional_brand_site_price' => $data['additional_brand_site_price'] ?? 0,
                    'additional_plain_site_price' => $data['additional_plain_site_price'] ?? 0,
                    'metadata' => $data['metadata'] ?? null,
                    'sort_order' => $data['sort_order'] ?? 0,
                    'is_active' => $data['is_active'] ?? true,
                ]);
                return $existingOption;
            }

            $option = ProductOption::create([
                'option_group_id' => $data['option_group_id'],
                'name' => $data['name'],
                'additional_price' => $data['additional_price'] ?? 0,
                'additional_brand_site_price' => $data['additional_brand_site_price'] ?? 0,
                'additional_plain_site_price' => $data['additional_plain_site_price'] ?? 0,
                'metadata' => $data['metadata'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $data['is_active'] ?? true,
            ]);
            return $option;
        });
    }

    public function updateProductOption(int $id, array $data): ProductOption
    {
        return DB::transaction(function () use ($id, $data) {
            $option = ProductOption::findOrFail($id);

            $updateData = [];
            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['additional_price'])) {
                $updateData['additional_price'] = $data['additional_price'];
            }
            if (isset($data['additional_brand_site_price'])) {
                $updateData['additional_brand_site_price'] = $data['additional_brand_site_price'];
            }
            if (isset($data['additional_plain_site_price'])) {
                $updateData['additional_plain_site_price'] = $data['additional_plain_site_price'];
            }
            if (array_key_exists('metadata', $data)) {
                $updateData['metadata'] = $data['metadata'];
            }
            if (isset($data['sort_order'])) {
                $updateData['sort_order'] = (int) $data['sort_order'];
            }
            if (array_key_exists('is_active', $data)) {
                $updateData['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            if (empty($updateData)) {
                return $option;
            }

            $option->update($updateData);

            return $option->fresh(['group', 'deletedByUser']);
        });
    }

    public function softDeleteProductOption(int $id): void
    {
        DB::transaction(function () use ($id) {
            $option = ProductOption::findOrFail($id);

            $option->delete();
        });
    }

    protected function canRestore(ProductOption $option): bool
    {
        $existingActive = ProductOption::where('option_group_id', $option->option_group_id)
            ->where('name', $option->name)
            ->whereNull('deleted_at')
            ->first();

        return ! $existingActive;
    }

    public function getOptionsWithTrashed(int $id): ProductOption
    {
        return ProductOption::withTrashed()->findOrFail($id);
    }
}
