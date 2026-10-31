<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the login/access history used by the admin member activity APIs.
     */
    public function up(): void
    {
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('login_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('browser_info')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('event_type', 30);
            $table->string('management')->nullable();
            $table->text('explanation')->nullable();
            $table->timestamp('connection_time')->nullable();
            $table->date('access_date')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'event_type', 'connection_time']);
            $table->index('access_date');
        });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};
