<?php

namespace App\Migration\Shared\Exceptions;

use Exception;

class FaqImportException extends Exception
{
    public function __construct(
        string $message,
        public readonly ?int $articleNo = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}