<?php

namespace App\Exceptions;

use RuntimeException;

class BackgroundInUseException extends RuntimeException
{
    /**
     * @param  array<int, array<string, mixed>>  $backgrounds
     */
    public function __construct(public readonly array $backgrounds)
    {
        parent::__construct('One or more backgrounds are being used by templates.', 409);
    }
}
