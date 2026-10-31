<?php

use App\Console\Commands\ExpirePoints;
use App\Console\Commands\ProcessQuarterlyMembershipUpgrade;
use App\Console\Commands\PruneExpiredSavedProductOptions;
use App\Console\Commands\SyncActiveShipmentTracking;
use App\Console\Commands\SyncMesStock;
use App\Console\Commands\UnpublishLowRatedReviews;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command(ProcessQuarterlyMembershipUpgrade::class)
    ->quarterly()
    ->at('00:00');

Schedule::command(ExpirePoints::class)
    ->dailyAt('00:01');

Schedule::command(UnpublishLowRatedReviews::class)
    ->dailyAt('00:00');

Schedule::command(PruneExpiredSavedProductOptions::class)
    ->dailyAt('00:30');

$trackingPollInterval = (int) config('services.sweettracker.poll_interval_minutes', 30);
Schedule::command(SyncActiveShipmentTracking::class)
    ->cron("*/{$trackingPollInterval} * * * *")
    ->withoutOverlapping();

if (config('services.mes.stock_sync_enabled', true)) {
    Schedule::command(SyncMesStock::class)
        ->hourly()
        ->withoutOverlapping(55);
}
