<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Notifications\DeliveryNotification;
use RuntimeException;

class AligoNotificationAdapter implements NotificationChannelAdapter
{
    public function __construct(
        private readonly AligoAlimTalkService $aligo,
    ) {}

    public function key(): string
    {
        return NotificationChannel::KAKAO->value;
    }

    public function send(mixed $notifiable, DeliveryNotification $notification): array
    {
        $delivery = $notification->delivery();
        $templateCode = $delivery->template_code;
        if (blank($templateCode)) {
            throw new RuntimeException('No Aligo template is configured for this notification.');
        }

        $template = $this->aligo->getTemplate($templateCode);
        $content = $template['templtContent'] ?? null;
        if (! is_string($content) || $content === '') {
            throw new RuntimeException("Aligo template content is unavailable: {$templateCode}");
        }

        $message = preg_replace_callback(
            '/#\\{([^}]+)\\}/',
            static fn (array $matches): string => (string) ($delivery->payload['variables'][$matches[1]] ?? $matches[0]),
            $content,
        );

        if (preg_match_all('/#\\{([^}]+)\\}/', $message, $unresolved) > 0) {
            throw new RuntimeException(
                'Aligo template contains unmapped variables: '.implode(', ', $unresolved[1])
            );
        }

        $buttons = $template['buttons'] ?? [];
        if (is_string($buttons)) {
            $buttons = json_decode($buttons, true) ?? [];
        }

        return $this->aligo->sendOne(
            templateCode: $templateCode,
            receiver: $delivery->recipient_address,
            message: $message,
            recvname: $delivery->recipient_name,
            subject: $delivery->payload['mail']['subject'] ?? null,
            buttons: $buttons,
        );
    }
}
