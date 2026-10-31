<?php

namespace App\Migration\Category\Readers;

use App\Migration\Shared\Clients\Cafe24Client;

class LegacyCategoryReader extends Cafe24Client
{
    /**
     * Get a paginated list of categories from the legacy system.
     *
     * Returns the raw `categories` array from the Cafe24 envelope.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getCategories(int $offset, int $limit): array
    {
        $payload = $this->get('/admin/categories', [
            'offset' => $offset,
            'limit' => $limit,
        ]);

        return $payload['categories'] ?? [];
    }

    /**
     * Get full category detail.
     *
     * @return array<string, mixed>
     */
    public function getCategoryDetail(int $categoryNo): array
    {
        $payload = $this->get("/admin/categories/{$categoryNo}");

        return $payload['category'] ?? [];
    }

    /**
     * Get category translations (e.g. English/Japanese names).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getCategoryTranslations(int $categoryNo): array
    {
        $payload = $this->get('/admin/translations/categories', [
            'category_no' => $categoryNo,
        ]);

        return $payload['translations'] ?? ($payload['translations_list'] ?? []);
    }
}
