<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Notifications\DeliveryNotification;
use Illuminate\Notifications\Channels\MailChannel;

class EmailNotificationAdapter implements NotificationChannelAdapter
{
    public function __construct(
        private readonly MailChannel $mailChannel,
    ) {}

    public function key(): string
    {
        return NotificationChannel::EMAIL->value;
    }

    public function send(mixed $notifiable, DeliveryNotification $notification): mixed
    {
        return $this->mailChannel->send($notifiable, $notification);
    }
}
