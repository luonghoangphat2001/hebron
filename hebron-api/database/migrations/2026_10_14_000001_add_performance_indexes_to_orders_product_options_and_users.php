<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Target tables and their performance indexes to add.
     *
     * @var array<string, array<string, array<int, string>>>
     */
    private const INDEXES = [
        'orders' => [
            'orders_user_id_created_at_index' => ['user_id', 'created_at'],
            'orders_status_created_at_index' => ['status', 'created_at'],
            'orders_created_at_index' => ['created_at'],
        ],
        'product_options' => [
            'product_options_group_active_sort_index' => ['option_group_id', 'is_active', 'sort_order'],
            'product_options_group_deleted_sort_index' => ['option_group_id', 'deleted_at', 'sort_order'],
        ],
        'users' => [
            'users_status_created_at_index' => ['status', 'created_at'],
            'users_created_at_index' => ['created_at'],
            'users_phone_index' => ['phone'],
            'users_mobile_index' => ['mobile'],
        ],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (self::INDEXES as $table => $indexes) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            foreach ($indexes as $name => $columns) {
                if (Schema::hasIndex($table, $name)) {
                    continue;
                }

                Schema::table($table, function (Blueprint $tableBlueprint) use ($name, $columns): void {
                    $tableBlueprint->index($columns, $name);
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (self::INDEXES as $table => $indexes) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            foreach (array_keys($indexes) as $name) {
                if (! Schema::hasIndex($table, $name)) {
                    continue;
                }

                Schema::table($table, function (Blueprint $tableBlueprint) use ($name): void {
                    $tableBlueprint->dropIndex($name);
                });
            }
        }
    }
};

