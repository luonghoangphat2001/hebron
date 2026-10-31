<?php

namespace App\Listeners;

use App\Events\NotificationDeliveriesRequested;
use App\Notifications\DeliveryNotification;
use App\Services\Notifications\NotificationDeliveryDispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;

class QueueNotificationDeliveries implements ShouldQueue
{
    public int $tries = DeliveryNotification::MAX_TRIES;

    public int $backoff = DeliveryNotification::BACKOFF_SECONDS;

    public function __construct(
        private readonly NotificationDeliveryDispatcher $dispatcher,
    ) {}

    public function handle(NotificationDeliveriesRequested $event): void
    {
        $this->dispatcher->dispatchMany($event->deliveryIds);
    }
}
