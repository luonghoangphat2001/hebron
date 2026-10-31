<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('example_sentence_samples', function (Blueprint $table) {
            $table->unsignedInteger('board_category_no')->default(0)->index();
        });
    }

    public function down(): void
    {
        Schema::table('example_sentence_samples', function (Blueprint $table) {
            $table->dropColumn('board_category_no');
        });
    }
};
