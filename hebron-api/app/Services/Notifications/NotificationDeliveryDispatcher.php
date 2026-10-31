<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Models\NotificationDelivery;
use App\Notifications\DeliveryNotification;
use Illuminate\Support\Facades\Notification;

class NotificationDeliveryDispatcher
{
    private const MAIL_ROUTE = 'mail';
    private const PROVIDER_ROUTE = 'provider-notification';

    /** @param array<int, int> $deliveryIds */
    public function dispatchMany(array $deliveryIds): void
    {
        NotificationDelivery::query()
            ->whereIn('id', $deliveryIds)
            ->whereIn('status', NotificationDeliveryStatus::dispatchableValues())
            ->each(function (NotificationDelivery $delivery): void {
                $route = $delivery->channel === NotificationChannel::EMAIL->value
                    ? self::MAIL_ROUTE
                    : self::PROVIDER_ROUTE;

                Notification::route($route, $delivery->recipient_address)
                    ->notify(new DeliveryNotification($delivery->id));
            });
    }
}
