<?php

namespace App\Migration\Shared\Exceptions;

use RuntimeException;

class Cafe24ApiException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $statusCode = 0,
        public readonly ?string $endpoint = null,
        public readonly ?array $response = null,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function fromResponse(
        string $endpoint,
        int $statusCode,
        ?array $body = null,
        ?\Throwable $previous = null,
    ): self {
        $message = sprintf('Cafe24 API error [%d] on %s', $statusCode, $endpoint);

        return new self($message, $statusCode, $endpoint, $body, $previous);
    }
}
