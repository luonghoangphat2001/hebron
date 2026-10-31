<?php

namespace App\Migration\Product\Readers;

use App\Migration\Shared\Clients\Cafe24Client;

class LegacyProductReader extends Cafe24Client
{
    /**
     * Get a paginated list of products from the legacy system.
     *
     * Returns the raw `products` array from the Cafe24 envelope.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getProducts(int $offset, int $limit): array
    {
        $payload = $this->get('/admin/products', [
            'offset' => $offset,
            'limit' => $limit,
        ]);

        return $payload['products'] ?? [];
    }

    /**
     * Get full product detail (with options embedded).
     *
     * @return array<string, mixed>
     */
    public function getProductDetail(int $productNo): array
    {
        $payload = $this->get("/admin/products/{$productNo}", [
            'embed' => 'options,additionalimages',
        ]);

        return $payload['product'] ?? [];
    }

    /**
     * Get standalone product options list.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getProductOptions(int $productNo): array
    {
        $payload = $this->get("/admin/products/{$productNo}/options");

        return $payload['options'] ?? [];
    }

    /**
     * Get product variants, including Cafe24's per-variant inventory setting.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getProductVariants(int $productNo): array
    {
        $payload = $this->get("/admin/products/{$productNo}/variants");

        return $payload['variants'] ?? [];
    }

    /**
     * Get product images list.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getProductImages(int $productNo, array $productDetail): array
    {
        $additionalImages = $productDetail['additionalimages'] ?? [];
        if (is_array($additionalImages) && array_key_exists('additional_image', $additionalImages)) {
            $additionalImages = $additionalImages['additional_image'];
        }

        if (is_string($additionalImages)) {
            $additionalImages = [$additionalImages];
        }

        if (! is_array($additionalImages)) {
            return [];
        }

        $images = [];
        foreach ($additionalImages as $index => $image) {
            if (is_string($image)) {
                $images[] = [
                    'image_no' => $index + 1,
                    'image_url' => $image,
                    'image_order' => $index + 1,
                ];
                continue;
            }

            if (! is_array($image)) {
                continue;
            }

            $url = $image['image_url'] ?? $image['additional_image'] ?? $image['url'] ?? null;
            if (! is_string($url) || $url === '') {
                continue;
            }

            $image['image_no'] ??= $index + 1;
            $image['image_url'] = $url;
            $image['image_order'] ??= $index + 1;
            $images[] = $image;
        }

        return $images;
    }

    /**
     * Get product categories (legacy system mapping).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getProductCategories(int $productNo): array
    {
        $payload = $this->get("/admin/products/{$productNo}/categories");

        return $payload['categories'] ?? [];
    }
}
