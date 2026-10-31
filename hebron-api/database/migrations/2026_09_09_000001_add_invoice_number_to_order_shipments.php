<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_shipments', function (Blueprint $table): void {
            $table->string('invoice_number', 100)->nullable()->after('status');
            $table->unique('order_id');
            $table->unique('invoice_number');
            $table->unique('tracking_number');
        });

        DB::table('order_shipments')
            ->where('status', 'shipped')
            ->update(['status' => 'in_transit']);

        DB::table('order_shipments')
            ->where('status', 'completed')
            ->update(['status' => 'delivered']);
    }

    public function down(): void
    {
        DB::table('order_shipments')
            ->where('status', 'in_transit')
            ->update(['status' => 'shipped']);

        DB::table('order_shipments')
            ->where('status', 'delivered')
            ->update(['status' => 'completed']);

        Schema::table('order_shipments', function (Blueprint $table): void {
            $table->dropUnique(['order_id']);
            $table->dropUnique(['invoice_number']);
            $table->dropUnique(['tracking_number']);
            $table->dropColumn('invoice_number');
        });
    }
};
