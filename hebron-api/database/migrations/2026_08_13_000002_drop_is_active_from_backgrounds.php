<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('backgrounds', 'is_active')) {
            Schema::table('backgrounds', function (Blueprint $table) {
                $table->dropIndex(['is_active', 'created_at']);
                $table->dropColumn('is_active');
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('backgrounds', 'is_active')) {
            Schema::table('backgrounds', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
                $table->boolean('is_active')->default(true)->after('image_path');
                $table->index(['is_active', 'created_at']);
            });
        }
    }
};
