<?php

namespace App\Migration\Product\DTO;

readonly class ProductOptionData
{
    public function __construct(
        public ?int $valueNo,
        public ?int $legacyOptionNo,
        public ?int $legacyVariantNo,
        public string $name,
        public string $value,
        public string $optionText,
        public float $additionalPrice,
        public int $sortOrder,
        public bool $isActive,
        public ?string $optionCode,
        public ?string $imageFile,
        public ?string $linkImage,
        public ?string $color,
        public array $metadata,
    ) {}
}
