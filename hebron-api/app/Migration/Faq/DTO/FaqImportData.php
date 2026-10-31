<?php

namespace App\Migration\Faq\DTO;

readonly class FaqImportData
{
    public function __construct(
        public int $legacyArticleNo,
        public int $boardCategoryNo,
        public string $category,
        public string $question,
        public string $answer,
        public string $createdDate,
        public string $writer,
        public string $display,
        public int $hit,
        public bool $isReply,
        public array $rawArticle,
    ) {}
}