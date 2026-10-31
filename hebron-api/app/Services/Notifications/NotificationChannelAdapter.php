<?php

namespace App\Services\Notifications;

use App\Notifications\DeliveryNotification;

interface NotificationChannelAdapter
{
    public const TAG = 'notification.channel.adapter';

    public function key(): string;

    public function send(mixed $notifiable, DeliveryNotification $notification): mixed;
}
