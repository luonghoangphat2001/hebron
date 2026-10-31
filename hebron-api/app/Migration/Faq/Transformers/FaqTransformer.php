<?php

namespace App\Migration\Faq\Transformers;

use App\Enums\FaqCategory;
use App\Migration\Faq\DTO\FaqImportData;
use App\Migration\Shared\Exceptions\FaqImportException;

class FaqTransformer
{
    public function transform(array $article): FaqImportData
    {
        $articleNo = (int) ($article['article_no'] ?? 0);
        if ($articleNo <= 0) {
            throw new FaqImportException('Article is missing a valid article_no.', $articleNo);
        }

        $boardCategoryNo = (int) ($article['board_category_no'] ?? 0);
        $category = FaqCategory::fromBoardCategory($boardCategoryNo)?->value
            ?? FaqCategory::ETC->value;

        return new FaqImportData(
            legacyArticleNo: $articleNo,
            boardCategoryNo: $boardCategoryNo,
            category: $category,
            question: $this->stripHtml((string) ($article['title'] ?? '')),
            answer: $this->stripHtml((string) ($article['content'] ?? '')),
            createdDate: (string) ($article['created_date'] ?? now()->toIso8601String()),
            writer: (string) ($article['writer'] ?? 'Unknown'),
            display: (string) ($article['display'] ?? 'F'),
            hit: (int) ($article['hit'] ?? 0),
            isReply: !empty($article['parent_article_no']),
            rawArticle: $article,
        );
    }

    protected function stripHtml(string $html): string
    {
        return strip_tags($html, '<br><p><ul><ol><li>');
    }
}