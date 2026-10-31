<?php

namespace App\Migration\ExampleSentenceSamples\Transformers;

use App\Migration\ExampleSentenceSamples\DTO\ExampleSentenceSampleImportData;

class ExampleSentenceSamplesTransformer
{
    public function transform(array $article): ExampleSentenceSampleImportData
    {
        $attachments = collect($article['attach_file_urls'] ?? [])->filter(
            fn (mixed $file): bool => is_array($file)
        )->map(
            fn (array $file) => [
                'no' => $file['no'] ?? null,
                'name' => $file['name'] ?? null,
                'url' => $this->absoluteUrl((string) ($file['url'] ?? '')),
            ]
        )->values()->all();

        return new ExampleSentenceSampleImportData(
            articleNo: (int) ($article['article_no'] ?? 0),
            boardCategoryNo: (int) ($article['board_category_no'] ?? 0),
            title: (string) ($article['title'] ?? ''),
            content: (string) ($article['content'] ?? ''),
            attachments: $attachments,
            isActive: ($article['display'] ?? 'F') === 'T' && ($article['deleted'] ?? 'F') !== 'T',
            isFeatured: ($article['fixed'] ?? 'F') === 'T',
            viewCount: (int) ($article['hit'] ?? 0),
            createdDate: $article['created_date'] ?? null,
        );
    }

    private function absoluteUrl(string $url): string
    {
        return str_starts_with($url, '//') ? 'https:' . $url : $url;
    }
}
