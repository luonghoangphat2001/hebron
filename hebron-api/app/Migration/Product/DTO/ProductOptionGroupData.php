<?php

namespace App\Migration\Product\DTO;

readonly class ProductOptionGroupData
{
    public function __construct(
        public ?int $legacyOptionNo,
        public ?string $optionCode,
        public string $code,
        public string $name,
        public string $displayType,
        public string $optionDisplayType,
        public string $optionListType,
        public ?string $optionPresetCode,
        public ?string $optionPresetName,
        public bool $isRequired,
        public bool $requiredOption,
        public bool $selectOneByOption,
        public bool $useAdditionalOption,
        public array $additionalOptions,
        public bool $useAttachedFileOption,
        public ?array $attachedFileOption,
        public int $sortOrder,
        public array $options,
    ) {}
}
