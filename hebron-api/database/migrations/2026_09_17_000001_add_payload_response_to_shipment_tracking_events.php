<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipment_tracking_events', function (Blueprint $table): void {
            if (! Schema::hasColumn('shipment_tracking_events', 'payload')) {
                $table->json('payload')->nullable();
            }
            if (! Schema::hasColumn('shipment_tracking_events', 'response')) {
                $table->json('response')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('shipment_tracking_events', function (Blueprint $table): void {
            $table->dropColumn(['payload', 'response']);
        });
    }
};
