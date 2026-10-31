<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pages/page_sections are now the canonical page-content model.
        Schema::dropIfExists('home_sections');
    }

    public function down(): void {}
};
