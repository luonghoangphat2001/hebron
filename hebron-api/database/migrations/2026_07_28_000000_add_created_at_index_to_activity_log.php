<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the index used by the admin task-log listing's default sort.
     *
     * Without this index MySQL must sort the entire activity_log table for
     * every first-page request, which can exhaust the server sort buffer.
     */
    public function up(): void
    {
        Schema::connection(config('activitylog.database_connection'))->table(
            config('activitylog.table_name'),
            function (Blueprint $table): void {
                $table->index(['created_at', 'id'], 'activity_log_created_at_id_index');
            }
        );
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        Schema::connection(config('activitylog.database_connection'))->table(
            config('activitylog.table_name'),
            function (Blueprint $table): void {
                $table->dropIndex('activity_log_created_at_id_index');
            }
        );
    }
};
