<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('inquiries', 'product_type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('product_type', 64)->nullable()->after('product_id');
            });
        }

        if (! Schema::hasColumn('inquiries', 'quantity_type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('quantity_type', 64)->nullable()->after('product_type');
            });
        }

        if (! Schema::hasColumn('inquiries', 'budget_type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('budget_type', 64)->nullable()->after('quantity_type');
            });
        }
    }

    public function down(): void
    {
        foreach (['product_type', 'quantity_type', 'budget_type'] as $column) {
            if (Schema::hasColumn('inquiries', $column)) {
                Schema::table('inquiries', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
