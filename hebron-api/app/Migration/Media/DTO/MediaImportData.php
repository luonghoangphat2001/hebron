<?php

namespace App\Migration\Media\DTO;

readonly class MediaImportData
{
    public function __construct(
        public int $articleNo,
        public int $boardCategoryNo,
        public string $title,
        public ?string $description,
        public ?string $url,
        public ?string $thumbnailPath,
        public bool $isActive,
        public ?string $createdDate,
    ) {}
}
