<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_group_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('design_group_id')
                ->constrained('design_groups')
                ->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->timestamps();

            $table->index(['design_group_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_group_files');
    }
};
