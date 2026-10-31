<?php

namespace App\Migration\Category\DTO;

readonly class CategoryImportData
{
    public function __construct(
        public int $legacyId,
        public int $legacyParentId,
        public int $depth,
        public string $name,
        public ?string $nameEn,
        public string $slug,
        public ?string $code,
        public ?array $fullCategoryName,
        public ?array $fullCategoryNo,
        public ?int $rootCategoryNo,
        public int $sortOrder,
        public ?string $displayType,
        public bool $isActive,
        public bool $isBest,
        public ?string $soldoutProductDisplay,
        public bool $hasChild,
        public array $rawDetail,
    ) {}
}
