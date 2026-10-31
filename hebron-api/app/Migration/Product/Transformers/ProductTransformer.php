<?php

namespace App\Migration\Product\Transformers;

use App\Migration\Product\DTO\ProductCategoryData;
use App\Migration\Product\DTO\ProductImageData;
use App\Migration\Product\DTO\ProductImportData;
use App\Migration\Product\DTO\ProductOptionData;
use App\Migration\Product\DTO\ProductOptionGroupData;

class ProductTransformer
{
    /**
     * Transform raw Cafe24 product detail + options + images into a DTO.
     *
     * @param  array<string, mixed>  $detail
     * @param  array<int, array<string, mixed>>  $rawOptions
     * @param  array<int, array<string, mixed>>  $rawImages
     * @param  array<int, array<string, mixed>>  $rawVariants
     */
    public function transform(
        array $detail,
        array $rawOptions = [],
        array $rawImages = [],
        array $rawVariants = [],
    ): ProductImportData {
        $name = trim((string) ($detail['product_name'] ?? ''));
        $nameEn = trim((string) ($detail['eng_product_name'] ?? ''));
        $customCode = trim((string) ($detail['custom_product_code'] ?? ''));
        $productCode = trim((string) ($detail['product_code'] ?? ''));

        return new ProductImportData(
            legacyId: (int) ($detail['product_no'] ?? 0),
            legacyProductCode: $productCode,
            customProductCode: $customCode,
            name: $name,
            nameEn: $nameEn !== '' ? $nameEn : null,
            nameJa: null,
            slug: $this->createSlug($name),
            sku: $customCode !== '' ? $customCode : ($productCode !== '' ? $productCode : null),
            description: $this->stringOrNull($detail['description'] ?? null),
            shortDescription: $this->firstNonEmpty([
                $detail['simple_description'] ?? null,
                $detail['summary_description'] ?? null,
            ]),
            mobileDescription: $this->stringOrNull($detail['mobile_description'] ?? null),
            price: (float) ($detail['price'] ?? 0),
            comparePrice: $this->floatOrNull($detail['retail_price'] ?? null),
            supplyPrice: (float) ($detail['supply_price'] ?? 0),
            priceExcludingTax: $this->floatOrNull($detail['price_excluding_tax'] ?? null),
            taxRate: $this->floatOrNull($detail['tax_rate'] ?? null),
            marginRate: $this->floatOrNull($detail['margin_rate'] ?? null),
            stockQuantity: $this->resolveStockQuantity($detail, $rawVariants),
            stockInventoryEnabled: $this->resolveStockInventoryEnabled($detail, $rawVariants),
            minQuantity: (int) ($detail['minimum_quantity'] ?? 1),
            maxQuantity: (int) ($detail['maximum_quantity'] ?? 0),
            sortOrder: (int) ($detail['display_order'] ?? $detail['sort_order'] ?? 0),
            legacyCategoryId: $this->resolvePrimaryCategoryId($detail),
            legacyCategoryIds: $this->resolveAllCategoryIds($detail),
            categories: $this->transformCategories($detail),
            images: $this->transformImages($rawImages, $detail),
            optionGroups: $this->transformOptions($rawOptions, $detail),
            hasOption: $this->toBool($detail['has_option'] ?? false),
            optionType: $this->resolveOptionTypeField($detail),
            displayStatus: (string) ($detail['display'] ?? 'T'),
            sellingStatus: (string) ($detail['selling'] ?? 'T'),
            approveStatus: $this->stringOrNull($detail['approve_status'] ?? null),
            isActive: $this->resolveIsActive($detail),
            isSoldOut: $this->toBool($detail['sold_out'] ?? false),
            isAdult: $this->toBool($detail['adult_certification'] ?? false),
            isAdultRequired: $this->toBool($detail['adult_certification'] ?? false),
            manufacturerCode: $this->stringOrNull($detail['manufacturer_code'] ?? null),
            brandCode: $this->stringOrNull($detail['brand_code'] ?? null),
            supplierCode: $this->stringOrNull($detail['supplier_code'] ?? null),
            trendCode: $this->stringOrNull($detail['trend_code'] ?? null),
            originPlaceCode: $this->intOrNull($detail['origin_place_code'] ?? null),
            madeInCode: $this->stringOrNull($detail['made_in_code'] ?? null),
            productCondition: $this->stringOrNull($detail['product_condition'] ?? null),
            productWeight: $this->stringOrNull($detail['product_weight'] ?? null),
            productMaterial: $this->stringOrNull($detail['product_material'] ?? null),
            additionalInformation: $this->transformAdditionalInformation($detail['additional_information'] ?? []),
            productTags: $this->normalizeStringList($detail['product_tag'] ?? []),
            relationalProduct: $this->stringOrNull($detail['relational_product'] ?? null),
            classificationCode: $this->stringOrNull($detail['classification_code'] ?? null),
            mainImage: $this->resolveMainImage($detail),
            listImage: $this->stringOrNull($detail['list_image'] ?? null),
            tinyImage: $this->stringOrNull($detail['tiny_image'] ?? null),
            smallImage: $this->stringOrNull($detail['small_image'] ?? null),
            detailImage: $this->stringOrNull($detail['detail_image'] ?? null),
            createdDate: $this->stringOrNull($detail['created_date'] ?? null),
            updatedDate: $this->stringOrNull($detail['updated_date'] ?? null),
            rawDetail: $detail,
            shippingFee: (float) ($detail['prepaid_shipping_fee'] ?? 0),
            priceContent: $this->stringOrNull($detail['price_content'] ?? null),
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $rawImages
     * @param  array<string, mixed>  $detail
     * @return array<int, ProductImageData>
     */
    protected function transformImages(array $rawImages, array $detail): array
    {
        $images = [];

        foreach ($rawImages as $idx => $img) {
            $images[] = new ProductImageData(
                legacyImageNo: (int) ($img['image_no'] ?? $img['no'] ?? 0),
                url: (string) ($img['image_url'] ?? $img['additional_image'] ?? $img['url'] ?? ''),
                bigUrl: $this->stringOrNull($img['big_image_url'] ?? $img['big'] ?? null),
                mediumUrl: $this->stringOrNull($img['medium_image_url'] ?? $img['medium'] ?? null),
                smallUrl: $this->stringOrNull($img['small_image_url'] ?? $img['small'] ?? null),
                tinyUrl: $this->stringOrNull($img['tiny_image_url'] ?? $img['tiny'] ?? null),
                sortOrder: (int) ($img['image_order'] ?? $img['sort_order'] ?? $idx),
                isMain: $this->toBool($img['is_main'] ?? $img['main'] ?? $idx === 0),
                description: $this->stringOrNull($img['description'] ?? $img['image_description'] ?? null),
            );
        }

        $mainImage = $this->resolveMainImage($detail);
        if ($mainImage !== null && ! collect($images)->contains(fn (ProductImageData $image): bool => $image->url === $mainImage)) {
            array_unshift($images, new ProductImageData(
                legacyImageNo: 0,
                url: $mainImage,
                bigUrl: $this->stringOrNull($detail['detail_image'] ?? null),
                mediumUrl: $this->stringOrNull($detail['list_image'] ?? null),
                smallUrl: $this->stringOrNull($detail['small_image'] ?? null),
                tinyUrl: $this->stringOrNull($detail['tiny_image'] ?? null),
                sortOrder: 0,
                isMain: true,
                description: null,
            ));
        }

        return $images;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rawOptions
     * @param  array<string, mixed>  $detail
     * @return array<int, ProductOptionGroupData>
     */
    protected function transformOptions(array $rawOptions, array $detail): array
    {
        $groups = [];

        // Cafe24 embeds options under detail.options when embed=options is used.
        // The embedded shape is a single object (not a list) with a top-level
        // `options` array of groups and metadata at the root.
        $embedded = $detail['options'] ?? null;
        if ($embedded !== null) {
            $rawOptions = $this->normalizeEmbeddedOptions($embedded);
        }

        $embeddedMeta = $this->extractEmbeddedOptionsMeta($embedded);

        foreach ($rawOptions as $idx => $group) {
            $options = [];
            $values = $group['option_value'] ?? $group['options'] ?? [];
            if (! is_array($values)) {
                $values = [];
            }

            foreach ($values as $oIdx => $option) {
                $optionText = (string) ($option['option_text'] ?? $option['value'] ?? $option['name'] ?? '');
                $valueNo = isset($option['value_no']) ? (int) $option['value_no'] : null;
                $additionalAmount = (float) ($option['additional_amount'] ?? $option['additional_price'] ?? 0);

                $options[] = new ProductOptionData(
                    valueNo: $valueNo,
                    legacyOptionNo: $valueNo,
                    legacyVariantNo: $valueNo,
                    name: $optionText,
                    value: $optionText,
                    optionText: $optionText,
                    additionalPrice: $additionalAmount,
                    sortOrder: (int) ($option['option_order'] ?? $option['sort_order'] ?? $oIdx),
                    isActive: $this->toBool($option['option_use'] ?? $option['is_active'] ?? true),
                    optionCode: $this->stringOrNull($option['option_code'] ?? $group['option_code'] ?? null),
                    imageFile: $this->stringOrNull($option['option_image_file'] ?? $option['image_file'] ?? null),
                    linkImage: $this->stringOrNull($option['option_link_image'] ?? $option['link_image'] ?? null),
                    color: $this->stringOrNull($option['option_color'] ?? null),
                    metadata: $this->extractOptionMetadata($option),
                );
            }

            $groupName = (string) ($group['option_name'] ?? $group['name'] ?? 'Option '.($idx + 1));
            $groupCode = (string) ($group['option_code'] ?? $group['code'] ?? 'opt_'.($idx + 1));

            $additionalOptions = $group['additional_options'] ?? $embeddedMeta['additional_options'] ?? [];
            $attachedFileOption = $group['attached_file_option']
                ?? $embeddedMeta['attached_file_option']
                ?? null;

            $groups[] = new ProductOptionGroupData(
                legacyOptionNo: isset($group['option_no']) ? (int) $group['option_no'] : null,
                optionCode: $this->stringOrNull($group['option_code'] ?? null),
                code: $groupCode,
                name: $groupName,
                displayType: (string) ($group['display_type'] ?? $group['option_display_type'] ?? $embeddedMeta['option_display_type'] ?? 'select'),
                optionDisplayType: (string) ($group['option_display_type'] ?? $embeddedMeta['option_display_type'] ?? 'S'),
                optionListType: (string) ($group['option_list_type'] ?? $embeddedMeta['option_list_type'] ?? 'S'),
                optionPresetCode: $this->stringOrNull($group['option_preset_code'] ?? $embeddedMeta['option_preset_code'] ?? null),
                optionPresetName: $this->stringOrNull($group['option_preset_name'] ?? $embeddedMeta['option_preset_name'] ?? null),
                isRequired: $this->toBool($group['is_required'] ?? $group['required_option'] ?? false),
                requiredOption: $this->toBool($group['required_option'] ?? false),
                selectOneByOption: $this->toBool($group['select_one_by_option'] ?? $embeddedMeta['select_one_by_option'] ?? false),
                useAdditionalOption: $this->toBool($group['use_additional_option'] ?? $embeddedMeta['use_additional_option'] ?? false),
                additionalOptions: is_array($additionalOptions) ? $additionalOptions : [],
                useAttachedFileOption: $this->toBool($group['use_attached_file_option'] ?? $embeddedMeta['use_attached_file_option'] ?? false),
                attachedFileOption: is_array($attachedFileOption) ? $attachedFileOption : null,
                sortOrder: (int) ($group['option_order'] ?? $group['sort_order'] ?? $idx),
                options: $options,
            );
        }

        return $groups;
    }

    /**
     * Cafe24 returns the embedded options block in two possible shapes:
     *  - object with `options` array of groups (newer API, embed=options)
     *  - direct list of groups (fallback)
     *
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeEmbeddedOptions(mixed $embedded): array
    {
        if (! is_array($embedded)) {
            return [];
        }

        if (isset($embedded['options']) && is_array($embedded['options'])) {
            return $embedded['options'];
        }

        if (array_is_list($embedded)) {
            return $embedded;
        }

        return [];
    }

    /**
     * Extract root-level metadata that lives on the embedded options object.
     *
     * @return array<string, mixed>
     */
    protected function extractEmbeddedOptionsMeta(mixed $embedded): array
    {
        if (! is_array($embedded) || array_is_list($embedded)) {
            return [];
        }

        $keys = [
            'option_type', 'option_list_type', 'option_preset_code', 'option_preset_name',
            'select_one_by_option', 'use_additional_option', 'additional_options',
            'use_attached_file_option', 'attached_file_option',
        ];

        return array_intersect_key($embedded, array_flip($keys));
    }

    /**
     * @param  array<string, mixed>  $option
     * @return array<string, mixed>
     */
    protected function extractOptionMetadata(array $option): array
    {
        $known = [
            'option_text', 'value', 'name', 'value_no', 'option_code',
            'additional_amount', 'additional_price', 'option_order', 'sort_order',
            'option_use', 'is_active', 'option_image_file', 'image_file',
            'option_link_image', 'link_image', 'option_color',
        ];

        $metadata = [];
        foreach ($option as $key => $value) {
            if (! in_array($key, $known, true)) {
                $metadata[$key] = $value;
            }
        }

        return $metadata;
    }

    /**
     * @param  array<string, mixed>  $detail
     * @return array<string, string>
     */
    protected function transformAdditionalInformation(array $additional): array
    {
        $result = [];
        foreach ($additional as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $name = trim((string) ($entry['name'] ?? ''));
            $value = trim((string) ($entry['value'] ?? ''));
            $key = trim((string) ($entry['key'] ?? ''));
            if ($name === '' && $key === '') {
                continue;
            }
            $label = $name !== '' ? $name : $key;
            $result[$label] = $value;
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $detail
     * @return array<int, ProductCategoryData>
     */
    protected function transformCategories(array $detail): array
    {
        $categories = $detail['category'] ?? [];
        if (! is_array($categories) || array_is_list($categories) === false) {
            $singleNo = $detail['category_no'] ?? $detail['category_id'] ?? null;
            if ($singleNo !== null) {
                $categories = [['category_no' => (int) $singleNo]];
            } else {
                $categories = [];
            }
        }

        $result = [];
        $index = 0;
        $primaryIndex = null;

        foreach ($categories as $entry) {
            if (! is_array($entry)) {
                continue;
            }

            $categoryNo = (int) ($entry['category_no'] ?? $entry['no'] ?? 0);
            if ($categoryNo <= 0) {
                continue;
            }

            $recommend = $this->toBool($entry['recommend'] ?? false);
            $new = $this->toBool($entry['new'] ?? false);

            $result[] = new ProductCategoryData(
                legacyCategoryId: $categoryNo,
                sortOrder: $index,
                isPrimary: false,
                recommend: $recommend,
                new: $new,
            );

            if ($primaryIndex === null && $recommend) {
                $primaryIndex = count($result) - 1;
            }

            $index++;
        }

        if ($result === []) {
            return [];
        }

        if ($primaryIndex === null) {
            $primaryIndex = 0;
        }

        $primary = $result[$primaryIndex];
        $result[$primaryIndex] = new ProductCategoryData(
            legacyCategoryId: $primary->legacyCategoryId,
            sortOrder: $primary->sortOrder,
            isPrimary: true,
            recommend: $primary->recommend,
            new: $primary->new,
        );

        return $result;
    }

    /**
     * @param  array<string, mixed>  $detail
     */
    protected function resolvePrimaryCategoryId(array $detail): int
    {
        foreach ($this->transformCategories($detail) as $cat) {
            if ($cat->isPrimary) {
                return $cat->legacyCategoryId;
            }
        }

        $ids = $this->resolveAllCategoryIds($detail);

        return $ids[0] ?? 0;
    }

    /**
     * @param  array<string, mixed>  $detail
     * @return array<int, int>
     */
    protected function resolveAllCategoryIds(array $detail): array
    {
        $categories = $detail['category'] ?? [];
        if (! is_array($categories)) {
            return [];
        }

        $ids = [];
        foreach ($categories as $cat) {
            if (! is_array($cat)) {
                continue;
            }
            $id = (int) ($cat['category_no'] ?? $cat['no'] ?? 0);
            if ($id > 0) {
                $ids[] = $id;
            }
        }

        return $ids;
    }

    /**
     * @param  array<string, mixed>  $detail
     */
    protected function resolveMainImage(array $detail): ?string
    {
        return $this->firstNonEmpty([
            $detail['list_image'] ?? null,
            $detail['detail_image'] ?? null,
            $detail['small_image'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $detail
     */
    protected function resolveStockQuantity(array $detail, array $variants = []): int
    {
        $soldOut = $this->toBool($detail['sold_out'] ?? false);
        if ($soldOut) {
            return 0;
        }

        $variantQuantities = array_values(array_filter(
            array_map(
                fn (array $variant): mixed => $variant['quantity'] ?? null,
                $variants,
            ),
            fn (mixed $value): bool => $value !== null && $value !== '',
        ));

        if ($variantQuantities !== []) {
            return max(0, array_sum(array_map(
                fn (mixed $quantity): int => max(0, (int) $quantity),
                $variantQuantities,
            )));
        }

        $stock = $detail['stock_quantity'] ?? null;
        if ($stock !== null && $stock !== '') {
            return (int) $stock;
        }

        return 999;
    }

    /**
     * Cafe24 uses use_inventory=T/F for the product inventory-management setting.
     * Keep the local default enabled for payloads from older API versions that do
     * not expose the setting, while preserving an explicit disabled value.
     *
     * @param  array<string, mixed>  $detail
     */
    protected function resolveStockInventoryEnabled(array $detail, array $variants = []): bool
    {
        $variantInventoryFlags = array_values(array_filter(
            array_map(
                fn (array $variant): mixed => $variant['use_inventory'] ?? null,
                $variants,
            ),
            fn (mixed $value): bool => $value !== null,
        ));

        if ($variantInventoryFlags !== []) {
            // A product is inventory-managed when at least one of its variants is.
            return collect($variantInventoryFlags)->contains(
                fn (mixed $value): bool => $this->toBool($value),
            );
        }

        if (! array_key_exists('use_inventory', $detail)) {
            return true;
        }

        return $this->toBool($detail['use_inventory']);
    }

    /**
     * @param  array<string, mixed>  $detail
     */
    protected function resolveIsActive(array $detail): bool
    {
        $display = strtoupper((string) ($detail['display'] ?? 'T'));
        $selling = strtoupper((string) ($detail['selling'] ?? 'T'));

        if (in_array($display, ['F', 'N', '0', 'HIDDEN'], true)) {
            return false;
        }

        if (in_array($selling, ['F', 'N', '0', 'STOPPED'], true)) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the product has options, taking the embedded
     * `options.has_option` flag and any fetched options into account.
     *
     * @param  array<int, array<string, mixed>>  $rawOptions
     * @param  array<string, mixed>  $detail
     */
    protected function resolveHasOption(array $rawOptions, array $detail): bool
    {
        if (! empty($rawOptions)) {
            return true;
        }

        $embedded = $detail['options'] ?? null;
        if (is_array($embedded) && ! array_is_list($embedded) && isset($embedded['has_option'])) {
            return $this->toBool($embedded['has_option']);
        }

        if (! empty($detail['options']) && is_array($detail['options'])) {
            return true;
        }

        return $this->toBool($detail['has_option'] ?? $detail['use_option'] ?? false);
    }

    /**
     * Resolve the `option_type` field from either the embedded block or the
     * top-level detail.
     *
     * @param  array<string, mixed>  $detail
     */
    protected function resolveOptionTypeField(array $detail): ?string
    {
        $embedded = $detail['options'] ?? null;
        if (is_array($embedded) && ! array_is_list($embedded) && isset($embedded['option_type'])) {
            return $this->stringOrNull($embedded['option_type']);
        }

        return $this->stringOrNull($detail['option_type'] ?? null);
    }

    /**
     * @param  array<string, mixed>  $option
     * @return array<string, mixed>
     */
    protected function extractMetadata(array $option): array
    {
        $known = [
            'option_no', 'option_name', 'option_value', 'option_code',
            'additional_amount', 'additional_price', 'option_order',
            'sort_order', 'option_use', 'is_active', 'variant_no',
            'required', 'display_type',
        ];

        $metadata = [];
        foreach ($option as $key => $value) {
            if (! in_array($key, $known, true)) {
                $metadata[$key] = $value;
            }
        }

        return $metadata;
    }

    public function createSlug(string $name): string
    {
        $slug = trim($name);

        $slug = mb_strtolower($slug, 'UTF-8');

        $slug = strip_tags($slug);

        $slug = str_replace(
            ['&', '@'],
            [' and ', ' at '],
            $slug
        );

        $slug = preg_replace('/[\s_]+/u', '-', $slug);

        $slug = preg_replace('/[^\p{L}\p{N}-]+/u', '', $slug);

        $slug = preg_replace('/-+/', '-', $slug);

        return trim($slug, '-');
    }

    /**
     * @param  array<int, mixed>  $values
     */
    protected function normalizeStringList(array $values): array
    {
        return array_values(array_filter(array_map(
            fn ($v) => is_string($v) ? trim($v) : (is_scalar($v) ? (string) $v : ''),
            $values,
        ), fn ($v) => $v !== ''));
    }

    /**
     * @param  array<int, mixed>  $candidates
     */
    protected function firstNonEmpty(array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if ($candidate === null) {
                continue;
            }
            $value = is_string($candidate) ? trim($candidate) : (string) $candidate;
            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }

    protected function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        return strtoupper((string) $value) === 'T';
    }

    protected function stringOrNull(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = is_string($value) ? trim($value) : (string) $value;

        return $value === '' ? null : $value;
    }

    protected function floatOrNull(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (float) $value : null;
    }

    protected function intOrNull(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }
}
