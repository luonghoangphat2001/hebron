<?php

namespace App\Services\Admin;

use App\Models\UnitPrice;
use App\Models\UnitPriceItem;
use App\Models\ErpOption;

class AdminPriceSimulationService
{
    public function simulate(array $filters): array
    {
        $erpOptionIds = $filters['erp_option_ids'] ?? [];
        $quantity = (int) ($filters['quantity'] ?? 1);

        $query = UnitPrice::query()
            ->with([
                'items',
                'erpOption',
            ])
            ->where('is_active', true);

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($erpOptionIds)) {
            $query->whereIn('erp_option_id', $erpOptionIds);
        }

        $unitPrices = $query->get();

        $totalRawCost = 0;
        $totalSellingPrice = 0;

        $results = [];

        foreach ($unitPrices as $unitPrice) {
            $matchedItem = $unitPrice->items
                ->where('quantity_min', '<=', $quantity)
                ->sortByDesc('quantity_min')
                ->first();

            if (!$matchedItem) {
                continue;
            }

            $rawCost = (float) ($matchedItem->raw_cost ?? 0);
            $sellingPrice = (float) $matchedItem->price_value;

            $totalRawCost += $rawCost;
            $totalSellingPrice += $sellingPrice;

            $results[] = [
                'unit_price_id' => $unitPrice->id,

                'unit_price_name' => $unitPrice->unit_price_name,

                'category' => $unitPrice->category,

                'erp_option' => $unitPrice->erpOption ? [
                    'id' => $unitPrice->erpOption->id,
                    'label' => $unitPrice->erpOption->label,
                    'attributes' => $unitPrice->erpOption->attributes,
                ] : null,

                'matched_item' => [
                    'id' => $matchedItem->id,

                    'quantity_min' => $matchedItem->quantity_min,

                    'price_value' => $sellingPrice,

                    'raw_cost' => $rawCost,

                    'profit' => $sellingPrice - $rawCost,

                    'profit_rate' => $rawCost > 0
                        ? round((($sellingPrice - $rawCost) / $rawCost) * 100, 2)
                        : 0,

                    'attributes' => $matchedItem->attributes,
                ],
            ];
        }

        return [
            'summary' => [
                'quantity' => $quantity,

                'total_raw_cost' => round($totalRawCost, 2),

                'total_selling_price' => round($totalSellingPrice, 2),

                'profit' => round(
                    $totalSellingPrice - $totalRawCost,
                    2
                ),

                'profit_rate' => $totalRawCost > 0
                    ? round(
                        (
                            ($totalSellingPrice - $totalRawCost)
                            / $totalRawCost
                        ) * 100,
                        2
                    )
                    : 0,
            ],

            'unit_prices' => $results,
        ];
    }
}
