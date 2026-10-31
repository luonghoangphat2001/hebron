<?php

namespace App\Migration\Inquiry\Readers;

use App\Migration\Shared\Clients\Cafe24Client;

class LegacyInquiryReader extends Cafe24Client
{
    /**
     * Get a paginated list of articles (inquiries) from the legacy system.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getArticles(int $offset, int $limit, int $boardNo): array
    {
        $payload = $this->get("/admin/boards/{$boardNo}/articles", [
            'offset' => $offset,
            'limit' => $limit,
        ]);

        return $payload['articles'] ?? [];
    }

    /**
     * Get a single article (inquiry) detail.
     *
     * @return array<string, mixed>
     */
    public function getArticle(int $boardNo, int $articleNo): array
    {
        $payload = $this->get("/admin/boards/{$boardNo}/articles/{$articleNo}");

        return $payload['article'] ?? [];
    }
}
