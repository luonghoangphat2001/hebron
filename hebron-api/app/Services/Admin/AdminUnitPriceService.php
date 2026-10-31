<?php

namespace App\Services\Admin;

use App\Enums\UnitPriceCategory;
use App\Enums\UnitPriceTab;
use App\Models\UnitPrice;
use App\Models\UnitPriceItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminUnitPriceService
{
    public function __construct(
        protected AdminUnitPriceChangeLogService $changeLogService,
    ) {}

    public function getSearchFilters(): array
    {
        return [
            'category' => array_combine(UnitPriceCategory::values(), UnitPriceCategory::values()),
            'unit_price_tab' => array_combine(UnitPriceTab::values(), UnitPriceTab::values()),
            'is_active' => [
                'true' => 'Active',
                'false' => 'Inactive',
                'all' => 'All',
            ],
        ];
    }

    public function getUnitPrices(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = UnitPrice::query();

        if (isset($filters['search_keyword']) && ! empty($filters['search_keyword'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('unit_price_name', 'like', '%' . $filters['search_keyword'] . '%')
                    ->orWhere('unit_price_key', 'like', '%' . $filters['search_keyword'] . '%');
            });
        }

        if (isset($filters['category']) && ! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $query->with(['allItems', 'erpOption'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    public function getUnitPrice(int $id): UnitPrice
    {
        return UnitPrice::with(['allItems', 'erpOption'])->findOrFail($id);
    }

    public function createUnitPrice($adminUser, array $data): UnitPrice
    {
        return DB::transaction(function () use ($data, $adminUser) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $options = $data['combination_options'] ?? [];

            $normalizedOptions = $this->normalizeCombinationOptions($options);
            $combinationKey = $this->generateCombinationKey($normalizedOptions);

            $unitPrice = UnitPrice::create([
                'erp_option_id' => $data['erp_option_id'] ?? null,
                'product_id' => $data['product_id'] ?? null,
                'category' => $data['category'],
                'unit_price_tab' => $data['unit_price_tab'] ?? null,
                'unit_price_name' => $data['unit_price_name'],
                'unit_price_key' => '',
                'combination_key' => $combinationKey,
                'combination_options' => $normalizedOptions,
                'applicable_estimate' => $data['applicable_estimate'] ?? null,
                'is_active' => $this->parseIsActive($data['is_active'] ?? true),
            ]);

            foreach ($items as $item) {
                $unitPrice->allItems()->create([
                    'price_value' => $item['price_value'],
                    'raw_cost' => $item['raw_cost'] ?? null,
                    'attributes' => $item['attributes'] ?? null,
                    'quantity_min' => $item['quantity_min'] ?? null,
                    'is_active' => $this->parseIsActive($item['is_active'] ?? true),
                    'created_by' => $adminUser?->id,
                    'updated_by' => null,
                ]);
            }

            return $unitPrice->load('allItems');
        });
    }

    public function updateUnitPrice(int $id, array $data, $adminUser): UnitPrice
    {
        $unitPrice = $this->getUnitPrice($id);

        return DB::transaction(function () use ($unitPrice, $data, $adminUser) {
            $items = $data['items'] ?? null;
            unset($data['items']);

            if (isset($data['is_active'])) {
                $data['is_active'] = $this->parseIsActive($data['is_active']);
            }

            $unitPrice->fill($data);
            $unitPrice->save();

            if ($items !== null) {
                $unitPrice->allItems()->delete();

                foreach ($items as $item) {
                    $unitPrice->allItems()->create([
                        'price_value' => $item['price_value'],
                        'raw_cost' => $item['raw_cost'] ?? null,
                        'attributes' => $item['attributes'] ?? null,
                        'quantity_min' => $item['quantity_min'] ?? null,
                        'is_active' => $this->parseIsActive($item['is_active'] ?? true),
                        'created_by' => $adminUser?->id,
                        'updated_by' => null,
                    ]);
                }
            }

            return $unitPrice->load('allItems');
        });
    }

    public function deleteUnitPrice(int $id): void
    {
        $unitPrice = $this->getUnitPrice($id);
        $unitPrice->delete();
    }

    public function toggleStatus(int $id): UnitPrice
    {
        $unitPrice = $this->getUnitPrice($id);
        $unitPrice->is_active = ! $unitPrice->is_active;
        $unitPrice->save();

        return $unitPrice;
    }

    public function getItemsByUnitPrice(int $unitPriceId, array $filters): Collection
    {
        $query = UnitPriceItem::where('unit_price_id', $unitPriceId);

        if (isset($filters['is_active']) && $filters['is_active'] !== 'all') {
            $isActive = $filters['is_active'] === 'true' ? true : false;
            $query->where('is_active', $isActive);
        }

        return $query->get();
    }

    public function createItem($adminUser, int $unitPriceId, array $data): UnitPriceItem
    {
        $unitPrice = $this->getUnitPrice($unitPriceId);

        return DB::transaction(function () use ($unitPrice, $data, $adminUser) {
            return $unitPrice->allItems()->create([
                'price_value' => $data['price_value'],
                'raw_cost' => $data['raw_cost'] ?? null,
                'attributes' => $data['attributes'] ?? null,
                'quantity_min' => $data['quantity_min'] ?? null,
                'is_active' => $this->parseIsActive($data['is_active'] ?? true),
                'created_by' => $adminUser?->id,
                'updated_by' => null,
            ]);
        });
    }

    public function updateItem(int $id, array $data, $adminUser): UnitPriceItem
    {
        $item = UnitPriceItem::findOrFail($id);

        return DB::transaction(function () use ($item, $data, $adminUser) {
            if (isset($data['is_active'])) {
                $data['is_active'] = $this->parseIsActive($data['is_active']);
            }

            $data['updated_by'] = $adminUser?->id;

            $priceBefore = (float) $item->price_value;

            $item->fill($data);
            $item->save();

            if (isset($data['price_value']) && (float) $data['price_value'] !== $priceBefore) {
                $this->changeLogService->logChange($item, $priceBefore, $adminUser?->id);
            }

            return $item;
        });
    }

    public function deleteItem(int $id): void
    {
        $item = UnitPriceItem::findOrFail($id);
        $item->delete();
    }

    private function parseIsActive($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            return in_array($value, ['true', '1', 'active', '1.0'], true);
        }

        return (bool) $value;
    }

    private function normalizeCombinationOptions(array $options): array
    {
        ksort($options);

        return $options;
    }

    private function generateCombinationKey(array $options): string
    {
        return collect($options)
            ->map(fn($value, $key) => "{$key}:{$value}")
            ->implode('|');
    }
}
