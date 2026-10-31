<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('inquiries', 'company_name')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('company_name', 255)->nullable()->after('product_id');
            });
        }

        if (! Schema::hasColumn('inquiries', 'manager_name')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('manager_name', 100)->nullable()->after('company_name');
            });
        }

        if (! Schema::hasColumn('inquiries', 'deadline')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->date('deadline')->nullable()->after('budget_type');
            });
        }
    }

    public function down(): void
    {
        foreach (['company_name', 'deadline'] as $column) {
            if (Schema::hasColumn('inquiries', $column)) {
                Schema::table('inquiries', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
