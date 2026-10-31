<?php

namespace App\Migration\Product\DTO;

readonly class ProductCategoryData
{
    public function __construct(
        public int $legacyCategoryId,
        public int $sortOrder,
        public bool $isPrimary,
        public bool $recommend,
        public bool $new,
    ) {}
}
