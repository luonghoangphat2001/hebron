<?php

namespace App\Migration\Notice\DTO;

readonly class NoticeImportData
{
    public function __construct(
        public int $legacyArticleNo,
        public int $boardCategoryNo,
        public string $title,
        public string $content,
        public string $type,
        public bool $isPinned,
        public bool $display,
        public int $hit,
        public string $createdDate,
        public string $writer,
        public ?array $attachments,
        public array $rawArticle,
    ) {}
}
