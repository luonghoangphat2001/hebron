<?php

namespace App\Migration\ExampleSentenceSamples\DTO;

readonly class ExampleSentenceSampleImportData
{
    public function __construct(
        public int $articleNo,
        public int $boardCategoryNo,
        public string $title,
        public string $content,
        public array $attachments,
        public bool $isActive,
        public bool $isFeatured,
        public int $viewCount,
        public ?string $createdDate,
    ) {}
}
