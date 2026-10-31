<?php

namespace App\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationDeliveriesRequested implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    /** @param  array<int, int>  $deliveryIds */
    public function __construct(
        public readonly array $deliveryIds,
    ) {}
}
