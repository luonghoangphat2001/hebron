<?php

namespace App\Providers;

use App\Events\MemberNotificationRequested;
use App\Events\NotificationDeliveriesRequested;
use App\Listeners\QueueNotificationDeliveries;
use App\Listeners\LogEmailSent;
use App\Listeners\StoreAndBroadcastMemberNotification;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use SocialiteProviders\Kakao\KakaoExtendSocialite;
use SocialiteProviders\Manager\SocialiteWasCalled;
use SocialiteProviders\Naver\NaverExtendSocialite;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        SocialiteWasCalled::class => [
            KakaoExtendSocialite::class,
            NaverExtendSocialite::class,
        ],
        NotificationDeliveriesRequested::class => [
            QueueNotificationDeliveries::class,
        ],
        MemberNotificationRequested::class => [
            StoreAndBroadcastMemberNotification::class,
        ],
        MessageSent::class => [
            LogEmailSent::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    /**
     * Keep event-to-listener mapping explicit in $listen.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
