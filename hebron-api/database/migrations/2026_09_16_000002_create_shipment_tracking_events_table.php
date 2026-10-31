<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('shipment_tracking_events')) {
            Schema::create('shipment_tracking_events', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('order_shipment_id')->constrained()->cascadeOnDelete();
                $table->string('provider_event_key', 64);
                $table->string('status', 32);
                $table->unsignedTinyInteger('provider_level')->nullable();
                $table->string('provider_code', 50)->nullable();
                $table->text('description')->nullable();
                $table->text('remark')->nullable();
                $table->string('location')->nullable();
                $table->timestamp('event_at')->nullable();
                $table->timestamps();
                $table->unique(
                    ['order_shipment_id', 'provider_event_key'],
                    'shipment_tracking_events_shipment_provider_event_unique'
                );
                $table->index(['order_shipment_id', 'event_at']);
            });
        } else {
            Schema::table('shipment_tracking_events', function (Blueprint $table): void {
                if (! Schema::hasColumn('shipment_tracking_events', 'provider_level')) {
                    $table->unsignedTinyInteger('provider_level')->nullable();
                }
                if (! Schema::hasColumn('shipment_tracking_events', 'provider_code')) {
                    $table->string('provider_code', 50)->nullable();
                }
                if (! Schema::hasColumn('shipment_tracking_events', 'remark')) {
                    $table->text('remark')->nullable();
                }
            });
        }

        Schema::table('order_shipments', function (Blueprint $table): void {
            if (! Schema::hasColumn('order_shipments', 'tracking_last_synced_at')) {
                $table->timestamp('tracking_last_synced_at')->nullable();
            }
            if (! Schema::hasColumn('order_shipments', 'tracking_level')) {
                $table->unsignedTinyInteger('tracking_level')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_shipments', fn (Blueprint $table) => $table->dropColumn(['tracking_last_synced_at', 'tracking_level']));
        Schema::dropIfExists('shipment_tracking_events');
    }
};
