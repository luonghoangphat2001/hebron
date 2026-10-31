<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Notifications\AligoNotificationAdapter;
use App\Services\Notifications\EmailNotificationAdapter;
use App\Services\Notifications\NotificationChannelAdapter;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use SocialiteProviders\Kakao\KakaoProvider;
use SocialiteProviders\Naver\Provider as NaverProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->tag([
            AligoNotificationAdapter::class,
            EmailNotificationAdapter::class,
        ], NotificationChannelAdapter::TAG);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force https in non-local environments to avoid mixed-content (Swagger, assets)
        if (! $this->app->environment('local', 'testing')) {
            URL::forceScheme('https');
        }

        // Register Kakao & Naver Socialite drivers
        Socialite::extend('kakao', function () {
            return Socialite::buildProvider(KakaoProvider::class, config('services.kakao'));
        });

        Socialite::extend('naver', function () {
            return Socialite::buildProvider(NaverProvider::class, config('services.naver'));
        });

        // Config IP access to monitor
        Gate::define('viewPulse', function (?User $user = null) {
            \Log::info('Pulse IP check', ['ip' => request()->ip(), 'allowIP' => config('app.allowIP', [])]);

            return in_array(request()->ip(), config('app.allowIP', []));
        });
    }
}
