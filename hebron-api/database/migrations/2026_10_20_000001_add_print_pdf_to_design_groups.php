<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->string('print_pdf_path')->nullable();
            $table->string('print_pdf_revision', 64)->nullable();
            $table->string('print_pdf_digest', 64)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('design_groups', fn (Blueprint $table) => $table->dropColumn(['print_pdf_path', 'print_pdf_revision', 'print_pdf_digest']));
    }
};
