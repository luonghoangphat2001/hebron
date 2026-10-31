<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calligraphies', function (Blueprint $table) {
            $table->string('text', 500)->nullable()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('calligraphies', function (Blueprint $table) {
            $table->dropColumn('text');
        });
    }
};
