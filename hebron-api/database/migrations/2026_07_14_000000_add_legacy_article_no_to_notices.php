<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->bigInteger('legacy_article_no')->nullable()->unique()->after('id');
            $table->json('legacy_data')->nullable();
            $table->mediumText('content')->change();
            $table->index('legacy_article_no');
        });
    }

    public function down(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->dropColumn('legacy_article_no');
            $table->dropColumn('legacy_data');
        });
    }
};