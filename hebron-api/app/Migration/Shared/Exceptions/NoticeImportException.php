<?php

namespace App\Migration\Shared\Exceptions;

use Exception;

class NoticeImportException extends Exception
{
    public function __construct(
        string $message = '',
        protected int $articleNo = 0,
        ?Exception $previous = null,
    ) {
        parent::__construct($message, $articleNo, $previous);
    }

    public function getArticleNo(): int
    {
        return $this->articleNo;
    }
}