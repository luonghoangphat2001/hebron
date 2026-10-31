<?php

namespace App\Services\Notifications;

final readonly class AligoAlimTalkMessage
{
    /**
     * @param array<int, array<string, mixed>> $buttons
     */
    public function __construct(
        public string $receiver,
        public string $message,
        public ?string $recvname = null,
        public ?string $subject = null,
        public array $buttons = [],
    ) {
    }
}