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
        Schema::create('order_design_contents', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('recipient_name')->nullable();
            $table->dateTime('event_date')->nullable();
            $table->text('main_text')->nullable();
            $table->string('sender_name')->nullable();
            $table->json('attachment_file_urls')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_design_contents');
    }
};
