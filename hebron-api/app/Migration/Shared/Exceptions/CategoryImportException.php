<?php

namespace App\Migration\Shared\Exceptions;

use RuntimeException;
use Throwable;

class CategoryImportException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $legacyCategoryId = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
