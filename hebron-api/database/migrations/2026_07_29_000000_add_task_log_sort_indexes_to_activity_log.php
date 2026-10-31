<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add indexes for the sortable columns used by the admin task-log list.
     */
    public function up(): void
    {
        Schema::connection(config('activitylog.database_connection'))->table(
            config('activitylog.table_name'),
            function (Blueprint $table): void {
                $table->index(['event', 'id'], 'activity_log_event_id_index');
                $table->index(['log_name', 'id'], 'activity_log_log_name_id_index');
                $table->index(['causer_id', 'id'], 'activity_log_causer_id_id_index');
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
                $table->dropIndex('activity_log_event_id_index');
                $table->dropIndex('activity_log_log_name_id_index');
                $table->dropIndex('activity_log_causer_id_id_index');
            }
        );
    }
};
