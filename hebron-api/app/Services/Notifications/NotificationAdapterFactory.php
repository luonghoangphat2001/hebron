<?php

namespace App\Services\Notifications;

use Illuminate\Contracts\Container\Container;
use RuntimeException;

class NotificationAdapterFactory
{
    public function __construct(
        private readonly Container $container,
    ) {}

    public function make(string $channel): NotificationChannelAdapter
    {
        foreach ($this->container->tagged(NotificationChannelAdapter::TAG) as $adapter) {
            if ($adapter->key() === $channel) {
                return $adapter;
            }
        }

        throw new RuntimeException("Unsupported notification channel: {$channel}");
    }
}
