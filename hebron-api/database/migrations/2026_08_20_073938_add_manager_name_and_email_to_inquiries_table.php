<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('inquiries', 'manager_name')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('manager_name', 100)->nullable()->after('contact');
            });
        }

        if (! Schema::hasColumn('inquiries', 'email')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('email', 255)->nullable()->after('manager_name');
            });
        }
    }

    public function down(): void
    {
        foreach (['manager_name', 'email'] as $column) {
            if (Schema::hasColumn('inquiries', $column)) {
                Schema::table('inquiries', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
