<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('design_group_files');
    }

    public function down(): void
    {
        // The original table structure is restored by the original migration
        // when rolling back to a pre-removal schema.
        Schema::create('design_group_files', function ($table) {
            $table->id();
            $table->foreignId('design_group_id')->constrained('design_groups')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->timestamps();
            $table->index(['design_group_id', 'created_at']);
        });
    }
};
