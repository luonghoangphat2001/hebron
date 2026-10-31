<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Database\Seeders\HomeSectionSeeder;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('home_sections')) {
            return;
        }

        if (! Schema::hasColumn('home_sections', 'site_type')) {
            Schema::table('home_sections', function (Blueprint $table) {
                $table->string('site_type', 50)->default('BRAND_SITE')->after('id');
            });
        }

        $convertedLocationType = false;

        if (Schema::hasColumn('home_sections', 'location_type')) {
            DB::table('home_sections')->update([
                'site_type' => DB::raw("
                    CASE location_type
                        WHEN 'brand' THEN 'BRAND_SITE'
                        WHEN 'admin' THEN 'PLAIN_SITE'
                        WHEN 'mail' THEN 'SHOPPING_MALL'
                        ELSE location_type
                    END
                "),
            ]);

            Schema::table('home_sections', function (Blueprint $table) {
                $table->dropColumn('location_type');
            });

            $convertedLocationType = true;
        }

        if ($convertedLocationType) {
            Schema::table('home_sections', function (Blueprint $table) {
                $table->unique(['site_type', 'type']);
                $table->index(['site_type', 'type', 'is_active']);
            });
        }

        HomeSectionSeeder::seed();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('home_sections') || Schema::hasColumn('home_sections', 'location_type')) {
            return;
        }

        Schema::table('home_sections', function (Blueprint $table) {
            $table->string('location_type', 50)->default('brand')->after('id');
        });

        DB::table('home_sections')->update([
            'location_type' => DB::raw("
                CASE site_type
                    WHEN 'BRAND_SITE' THEN 'brand'
                    WHEN 'PLAIN_SITE' THEN 'admin'
                    WHEN 'SHOPPING_MALL' THEN 'mail'
                    ELSE site_type
                END
            "),
        ]);

        Schema::table('home_sections', function (Blueprint $table) {
            $table->dropColumn('site_type');
        });
    }

};
