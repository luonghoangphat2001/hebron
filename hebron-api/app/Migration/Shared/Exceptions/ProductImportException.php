<?php

namespace App\Migration\Shared\Exceptions;

use RuntimeException;

class ProductImportException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?int $legacyProductId = null,
        public readonly ?int $legacyCategoryId = null,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
