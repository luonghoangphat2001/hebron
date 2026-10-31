<?php

namespace App\Migration\Media\Readers;

use App\Migration\Shared\Clients\Cafe24Client;

class MediaReader extends \App\Migration\Shared\Clients\Cafe24Client
{
    public function getArticles(int $offset, int $limit, int $boardNo): array
    {
        $payload = $this->get("/admin/boards/{$boardNo}/articles", [
            'offset' => $offset,
            'limit' => $limit,
        ]);

        return $payload['articles'] ?? [];
    }
}
