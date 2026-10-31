<?php

namespace App\Services\Admin;

use App\Models\CraftsmanshipValue;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminCraftsmanshipValueService
{
    private const MAX_VALUES = 3;

    public function paginate(array $filters): LengthAwarePaginator
    {
        return CraftsmanshipValue::query()
            ->with('products')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(fn ($nested) => $nested
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%"));
            })
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->ordered()
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function get(int $id): CraftsmanshipValue
    {
        return CraftsmanshipValue::query()->with('products')->findOrFail($id);
    }

    public function create(array $data): CraftsmanshipValue
    {
        return DB::transaction(function () use ($data): CraftsmanshipValue {
            $existingCount = CraftsmanshipValue::query()
                ->lockForUpdate()
                ->get(['id'])
                ->count();

            if ($existingCount >= self::MAX_VALUES) {
                throw ValidationException::withMessages([
                    'craftsmanship_values' => ['A maximum of 3 craftsmanship values can be created.'],
                ]);
            }

            $value = CraftsmanshipValue::query()->create(Arr::except($data, 'product_ids'));
            $this->syncProducts($value, $data['product_ids'] ?? []);

            return $value->load('products');
        });
    }

    public function update(int $id, array $data): CraftsmanshipValue
    {
        return DB::transaction(function () use ($id, $data): CraftsmanshipValue {
            $value = CraftsmanshipValue::query()->findOrFail($id);
            $value->update(Arr::except($data, 'product_ids'));

            if (array_key_exists('product_ids', $data)) {
                $this->syncProducts($value, $data['product_ids']);
            }

            return $value->load('products');
        });
    }

    public function delete(int $id): void
    {
        CraftsmanshipValue::query()->findOrFail($id)->delete();
    }

    private function syncProducts(CraftsmanshipValue $value, array $productIds): void
    {
        $value->products()->sync(collect($productIds)->mapWithKeys(
            fn ($productId, int $index): array => [(int) $productId => ['sort_order' => $index]],
        )->all());
    }
}
