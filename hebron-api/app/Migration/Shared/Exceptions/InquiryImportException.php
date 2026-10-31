<?php

namespace App\Migration\Shared\Exceptions;

use Throwable;

class InquiryImportException extends \RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?int $legacyArticleNo = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
