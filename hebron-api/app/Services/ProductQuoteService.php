<?php

namespace App\Services;

use App\Enums\SiteType;
use App\Models\Product;
use App\Models\ProductOption;
use InvalidArgumentException;
use RuntimeException;

class ProductQuoteService
{
    public function quote(
        int $productId,
        array $payload,
        int $quantity = 1,
        SiteType $siteType = SiteType::SHOPPING_MALL
    ): array {
        if ($quantity < 1) {
            throw new InvalidArgumentException('수량은 1개 이상이어야 합니다.');
        }

        $product = Product::with([
            'categories',
            'specification',
            'optionGroups.options',
        ])->find($productId);

        if (! $product) {
            throw new RuntimeException('제품을 찾을 수 없습니다.');
        }

        $selectedOptions = $this->mapSelectedOptions(
            $product,
            $payload['selected_options'] ?? [],
            $siteType
        );

        $optionTotal = collect($selectedOptions)
            ->sum(fn (array $option) => $option['option']['additional_price']);
        $sellingPrice = $this->getSitePrice($product, $siteType);

        $lineSupplyPrice = (int) round(((float) ($product->supply_price ?? 0)) * $quantity);
        $lineSellingPrice = (int) round(((float) $sellingPrice) * $quantity);
        $lineOptionPrice = (int) round(((float) $optionTotal) * $quantity);

        $subTotal = $lineSellingPrice + $lineOptionPrice;
        $vat = $this->calculateVat($subTotal);
        $shipping_fee = $product->shipping_fee;

        return [
            'supply_price' => $lineSupplyPrice,
            'selling_price' => $lineSellingPrice,
            'option_price' => $lineOptionPrice,
            'selected_options' => $selectedOptions,
            'subtotal_amount' => round($subTotal),
            'tax_amount' => $vat,
            'total_amount' => round($subTotal + $shipping_fee),
            'quantity' => $quantity,
            'shipping_fee' => $shipping_fee,
            'estimated_production_days' => $product->specification?->production_time_days ?? 0,
            'site_type' => $siteType,
        ];
    }

    private function calculateVat(float|int $amount): int
    {
        // Product and option prices already include VAT.
        return 0;
    }

    private function mapSelectedOptions(
        Product $product,
        array $selectedOptions,
        SiteType $siteType
    ): array {
        if (empty($selectedOptions)) {
            return [];
        }

        $groups = $product->optionGroups->keyBy('id');

        return collect($selectedOptions)
            ->map(function (array $selection) use ($groups, $siteType) {
                // API requests use group_id/option_id, while cart and order
                // snapshots persist the enriched quote shape (group.id/option.id).
                // Re-quoting must support both shapes so a cart item can always
                // be priced again from its server-stored option selection.
                $groupId = $selection['group_id'] ?? data_get($selection, 'group.id');
                $optionId = $selection['option_id'] ?? data_get($selection, 'option.id');

                $group = $groups->get($groupId);

                if (! $group) {
                    throw new InvalidArgumentException('선택한 옵션 그룹이 유효하지 않습니다.');
                }

                $option = $group->options
                    ->keyBy('id')
                    ->get($optionId);

                if (! $option) {
                    throw new InvalidArgumentException('선택한 옵션이 유효하지 않습니다.');
                }

                return [
                    'group' => [
                        'id' => $group->id,
                        'code' => $group->code,
                        'name' => $group->name,
                    ],
                    'option' => [
                        'id' => $option->id,
                        'name' => $option->name,
                        'additional_price' => $this->getOptionPrice($option, $siteType),
                    ],
                ];
            })
            ->values()
            ->all();
    }

    private function getSitePrice(Product $product, SiteType $siteType): float
    {
        return match ($siteType) {
            SiteType::SHOPPING_MALL => (float) $product->selling_price,
            SiteType::BRAND_SITE => (float) $product->brand_site_price,
            SiteType::PLAIN_SITE => (float) $product->plain_site_price,
        };
    }

    private function getOptionPrice(
        ProductOption $option,
        SiteType $siteType
    ): float {
        return match ($siteType) {
            SiteType::SHOPPING_MALL => (float) $option->additional_price,
            SiteType::BRAND_SITE => (float) $option->additional_brand_site_price,
            SiteType::PLAIN_SITE => (float) $option->additional_plain_site_price,
        };
    }
}
