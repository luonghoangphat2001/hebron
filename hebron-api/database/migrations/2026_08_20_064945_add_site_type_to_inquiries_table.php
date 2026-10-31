<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('inquiries', 'site_type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('site_type', 64)->nullable()->after('product_type');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('inquiries', 'site_type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->dropColumn('site_type');
            });
        }
    }
};
