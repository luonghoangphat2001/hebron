<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const INDEXES = [
        'inquiries_created_at_index' => ['created_at'],
        'inquiries_status_created_at_index' => ['status', 'created_at'],
        'inquiries_category_created_at_index' => ['category', 'created_at'],
        'inquiries_replied_by_created_at_index' => ['replied_by', 'created_at'],
    ];

    public function up(): void
    {
        foreach (self::INDEXES as $name => $columns) {
            if (Schema::hasIndex('inquiries', $name)) {
                continue;
            }

            Schema::table('inquiries', function (Blueprint $table) use ($name, $columns): void {
                $table->index($columns, $name);
            });
        }
    }

    public function down(): void
    {
        foreach (array_keys(self::INDEXES) as $name) {
            if (! Schema::hasIndex('inquiries', $name)) {
                continue;
            }

            Schema::table('inquiries', function (Blueprint $table) use ($name): void {
                $table->dropIndex($name);
            });
        }
    }
};
