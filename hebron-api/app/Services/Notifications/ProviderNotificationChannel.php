<?php

namespace App\Services\Notifications;

use App\Enums\NotificationDeliveryStatus;
use App\Notifications\DeliveryNotification;
use Throwable;

class ProviderNotificationChannel
{
    public function __construct(
        private readonly NotificationAdapterFactory $adapterFactory,
    ) {}

    public function send(mixed $notifiable, DeliveryNotification $notification): mixed
    {
        $delivery = $notification->delivery();
        if ($delivery->status instanceof NotificationDeliveryStatus
            && $delivery->status->isAcceptedByProvider()) {
            return $delivery->provider_response;
        }

        $delivery->increment('attempts');
        $delivery->update(['status' => NotificationDeliveryStatus::SENDING, 'error_message' => null]);

        try {
            $response = $this->adapterFactory->make($delivery->channel)->send($notifiable, $notification);
            $delivery->update([
                'status' => NotificationDeliveryStatus::ACCEPTED,
                'provider_response' => is_array($response) ? $response : ['provider' => 'smtp'],
                'sent_at' => now(),
            ]);

            return $response;
        } catch (Throwable $e) {
            $delivery->update([
                'status' => NotificationDeliveryStatus::FAILED,
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
