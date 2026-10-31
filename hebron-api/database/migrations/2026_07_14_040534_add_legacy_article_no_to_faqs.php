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
        Schema::table('faqs', function (Blueprint $table) {
            $table->unsignedInteger('legacy_article_no')->nullable()->index()->after('id')->comment('Legacy article ID from Cafe24');
            $table->mediumText('answer')->change();
            $table->json('legacy_data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->dropColumn('legacy_article_no');
            $table->dropColumn('legacy_data');
        });
    }
};
