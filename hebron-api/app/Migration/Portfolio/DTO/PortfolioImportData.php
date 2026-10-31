<?php

namespace App\Migration\Portfolio\DTO;

readonly class PortfolioImportData
{
    public function __construct(
        public int $articleNo,
        public int $boardCategoryNo,
        public string $title,
        public ?string $description,
        public ?string $coverImage,
        public array $gallery,
        public bool $isFeatured,
        public bool $isActive,
        public ?string $createdDate,
    ) {}
}
