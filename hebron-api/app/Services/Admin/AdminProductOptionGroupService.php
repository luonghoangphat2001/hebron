<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminProductOptionGroupResource;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionGroupProduct;
use App\Services\PaginationService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminProductOptionGroupService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function getProductOptionGroups(array $filters, int $perPage = 20): array
    {
        $query = ProductOptionGroup::with(['options'])->withCount('products');

        $code = Arr::get($filters, 'code');
        $name = Arr::get($filters, 'name');
        $displayType = Arr::get($filters, 'display_type');
        $isRequired = Arr::get($filters, 'is_required');


        if ($code) {
            $query->where('code', 'like', '%' . $code . '%');
        }

        if ($name) {
            $query->where('name', 'like', '%' . $name . '%');
        }

        if ($displayType) {
            $query->where('display_type', $displayType);
        }

        if ($isRequired !== null) {
            $query->where('is_required', filter_var($isRequired, FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = Arr::get($filters, 'sort_by', 'id');
        $sortOrder = Arr::get($filters, 'sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);
        
        $productOptionGroups = $query->paginate($perPage);
        return [
            'product_option_groups' => AdminProductOptionGroupResource::collection($productOptionGroups->items()),
            'pagination' => $this->paginationService->format($productOptionGroups),
        ];
    }

    public function getProductOptionGroup(int $id): ProductOptionGroup
    {
        return ProductOptionGroup::with([
            'options',
            'products' => fn ($query) => $query
                ->reorder('products.sort_order')
                ->orderBy('products.id'),
        ])->withCount('products')->findOrFail($id);
    }

    public function createProductOptionGroup(array $data): ProductOptionGroup
    {
        return DB::transaction(function () use ($data) {

            $group = ProductOptionGroup::create([
                'code' => $data['code'],
                'name' => $data['name'],
                'display_type' => $data['display_type'] ?? 'select',
                'is_required' => $data['is_required'] ?? false
            ]);

            return $group;
        });
    }

    public function updateProductOptionGroup(int $id, array $data): ProductOptionGroup
    {
        return DB::transaction(function () use ($id, $data) {
            $group = ProductOptionGroup::findOrFail($id);

            if (isset($data['code']) && $data['code'] !== $group->code) {
                throw new \Exception('Code field cannot be modified.', 422);
            }

            $updateData = [];

            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['display_type'])) {
                $updateData['display_type'] = $data['display_type'];
            }
            if (isset($data['is_required'])) {
                $updateData['is_required'] = filter_var($data['is_required'], FILTER_VALIDATE_BOOLEAN);
            }

            if (! empty($updateData)) {
                $group->update($updateData);
            }

            return $group->fresh(['options']);
        });
    }

    public function deleteProductOptionGroup(int $id): void
    {
        DB::transaction(function () use ($id) {
            $group = ProductOptionGroup::with(['options'])->findOrFail($id);
            if ($group->options()->count() > 0) {
                throw new \Exception('Cannot delete option group with active options. Please delete options first.', 422);
            }
            $group->delete();
        });
    }

    public function assignProducts(int $id, array $productIds): ProductOptionGroup
    {
        return DB::transaction(function () use ($id, $productIds) {
            $group = ProductOptionGroup::with(['options'])->findOrFail($id);

            $productIds = array_values(array_unique($productIds));
            $links = ProductOptionGroupProduct::withTrashed()
                ->where('product_option_group_id', $group->id)
                ->get()
                ->keyBy('product_id');

            foreach ($links as $link) {
                if (! in_array($link->product_id, $productIds, true) && ! $link->trashed()) {
                    $link->delete();
                }
            }

            $sortOrder = 1;
            foreach ($productIds as $productId) {
                $link = $links->get($productId);

                if ($link) {
                    if ($link->trashed()) {
                        $link->restore();
                    }
                    $link->update(['sort_order' => $sortOrder++]);
                    continue;
                }

                ProductOptionGroupProduct::create([
                    'product_option_group_id' => $group->id,
                    'product_id' => $productId,
                    'sort_order' => $sortOrder++,
                ]);
            }

            return $group->fresh(['options', 'products']);
        });
    }
}
