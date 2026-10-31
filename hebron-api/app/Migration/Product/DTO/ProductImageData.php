<?php

namespace App\Migration\Product\DTO;

readonly class ProductImageData
{
    public function __construct(
        public int $legacyImageNo,
        public string $url,
        public ?string $bigUrl,
        public ?string $mediumUrl,
        public ?string $smallUrl,
        public ?string $tinyUrl,
        public int $sortOrder,
        public bool $isMain,
        public ?string $description,
    ) {}
}
