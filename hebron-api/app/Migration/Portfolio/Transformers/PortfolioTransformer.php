<?php

namespace App\Migration\Portfolio\Transformers;

use App\Migration\Portfolio\DTO\PortfolioImportData;

class PortfolioTransformer
{
    public function transform(array $article): PortfolioImportData
    {
        $images = collect($article['attach_file_urls'] ?? [])
            ->pluck('url')->filter()->map(fn (string $url) => $this->absoluteUrl($url))
            ->unique()->values()->all();
        $content = (string) ($article['content'] ?? '');

        preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $matches);
        $contentImage = isset($matches[1]) && ! str_starts_with($matches[1], 'data:')
            ? $this->absoluteUrl($matches[1])
            : null;

        return new PortfolioImportData(
            articleNo: (int) ($article['article_no'] ?? 0),
            boardCategoryNo: (int) ($article['board_category_no'] ?? 0),
            title: (string) ($article['title'] ?? ''),
            description: $content ?: null,
            coverImage: $contentImage ?? ($images[0] ?? null),
            gallery: $images,
            isFeatured: ($article['fixed'] ?? 'F') === 'T',
            isActive: ($article['display'] ?? 'F') === 'T' && ($article['deleted'] ?? 'F') !== 'T',
            createdDate: $article['created_date'] ?? null,
        );
    }

    private function absoluteUrl(string $url): string
    {
        return str_starts_with($url, '//') ? 'https:'.$url : $url;
    }
}
