<?php

use App\Enums\SiteType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->string('site_type', 50)->default(SiteType::SHOPPING_MALL->value)->after('exposure_target');
            $table->index(['site_type', 'is_active', 'published_at'], 'notices_site_visibility_index');
        });
    }

    public function down(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->dropIndex('notices_site_visibility_index');
            $table->dropColumn('site_type');
        });
    }
};
