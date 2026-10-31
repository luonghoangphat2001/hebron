<?php

namespace App\Migration\ExampleSentenceSamples\Readers;

use App\Migration\Shared\Clients\Cafe24Client;

class ExampleSentenceSamplesReader extends Cafe24Client
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
