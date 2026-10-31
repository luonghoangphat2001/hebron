<?php

namespace App\Migration\Category\Transformers;

use App\Migration\Category\DTO\CategoryImportData;
use Illuminate\Support\Str;

class CategoryTransformer
{
    /**
     * Transform raw Cafe24 category detail (+ optional translations) into a DTO.
     *
     * @param  array<string, mixed>  $detail
     * @param  array<int, array<string, mixed>>  $translations
     */
    public function transform(array $detail, array $translations = []): CategoryImportData
    {
        $name = trim((string) ($detail['category_name'] ?? ''));
        $categoryNo = (int) ($detail['category_no'] ?? 0);
        $parentNo = (int) ($detail['parent_category_no'] ?? 0);
        
        return new CategoryImportData(
            legacyId: $categoryNo,
            legacyParentId: $parentNo,
            depth: (int) ($detail['category_depth'] ?? ($parentNo > 0 ? 2 : 1)),
            name: $name,
            nameEn: $this->resolveTranslation($translations, 'en', 'category_name'),
            slug: $this->createSlug($name),
            code: $this->stringOrNull($detail['category_code'] ?? null),
            fullCategoryName: $detail['full_category_name'],
            fullCategoryNo: $detail['full_category_no'],
            rootCategoryNo: $this->intOrNull($detail['root_category_no'] ?? null),
            sortOrder: (int) ($detail['display_order'] ?? 0),
            displayType: $this->stringOrNull($detail['display_type'] ?? null),
            isActive: $this->resolveIsActive($detail),
            isBest: $this->toBool($detail['use_main'] ?? false),
            soldoutProductDisplay: $this->stringOrNull($detail['soldout_product_display'] ?? null),
            hasChild: $this->toBool($detail['has_child'] ?? false),
            rawDetail: $detail,
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $translations
     */
    protected function resolveTranslation(array $translations, string $languageCode, string $field): ?string
    {
        foreach ($translations as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            if (strcasecmp((string) ($entry['language_code'] ?? ''), $languageCode) !== 0) {
                continue;
            }

            $value = $entry[$field] ?? null;
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    function createSlug(string $name): string
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
     * @param  array<string, mixed>  $detail
     */
    protected function resolveIsActive(array $detail): bool
    {
        $displayType = strtoupper((string) ($detail['display_type'] ?? 'A'));
        if (in_array($displayType, ['F', 'N', '0'], true)) {
            return false;
        }

        $useDisplay = $detail['use_display'] ?? 'T';
        if (is_string($useDisplay) && in_array(strtoupper($useDisplay), ['F', 'N', '0'], true)) {
            return false;
        }
        if (is_numeric($useDisplay) && (int) $useDisplay === 0) {
            return false;
        }

        return true;
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
        if ($value === null || is_array($value) || is_object($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    protected function intOrNull(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }
}
