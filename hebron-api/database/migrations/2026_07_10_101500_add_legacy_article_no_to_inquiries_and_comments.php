<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->bigInteger('legacy_article_no')->nullable()->unique()->after('id');
            $table->json('legacy_data')->nullable();
            $table->index('legacy_article_no');
            $table->foreignId('user_id')
                ->nullable()
                ->change();
            $table->string('category')->nullable()->change();
            $table->mediumText('content')->change();
        });

        Schema::table('inquiry_comments', function (Blueprint $table) {
            $table->bigInteger('legacy_article_no')->nullable()->unique()->after('id');
            $table->json('legacy_data')->nullable();
            $table->index('legacy_article_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn('legacy_article_no');
            $table->dropColumn('legacy_data');
            $table->foreignId('user_id')
                ->nullable(false)
                ->change();
        });

        Schema::table('inquiry_comments', function (Blueprint $table) {
            $table->dropColumn('legacy_article_no');
            $table->dropColumn('legacy_data');
        });
    }
};