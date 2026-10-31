<?php

namespace App\Notifications;

use App\Models\NotificationDelivery;
use App\Services\Notifications\ProviderNotificationChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeliveryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public const MAX_TRIES = 3;
    public const BACKOFF_SECONDS = 30;

    public int $tries = self::MAX_TRIES;

    public int $backoff = self::BACKOFF_SECONDS;

    public function __construct(
        private readonly int $deliveryId,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return [ProviderNotificationChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = $this->delivery()->payload['mail'];
        $message = (new MailMessage)
            ->subject($mail['subject'])
            ->greeting($mail['greeting']);

        foreach ($mail['lines'] as $line) {
            $message->line($line);
        }

        return $message->salutation($mail['salutation']);
    }

    public function delivery(): NotificationDelivery
    {
        return NotificationDelivery::findOrFail($this->deliveryId);
    }
}
