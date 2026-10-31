<?php

use App\Enums\MesIntegrationDirection;
use App\Enums\MesIntegrationStatus;
use App\Enums\MesReferenceType;
use App\Enums\MesTriggerType;
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
        Schema::create('mes_integration_logs', function (Blueprint $table) {
            $table->id();

            $table->string('direction', 20);
            $table->string('trigger_type', 50);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->string('http_method', 10);
            $table->string('endpoint');
            $table->json('request_headers')->nullable();
            $table->json('request_body')->nullable();

            $table->unsignedSmallInteger('response_status')->nullable();
            $table->json('response_headers')->nullable();
            $table->json('response_body')->nullable();

            $table->string('status', 30);
            $table->unsignedMediumInteger('duration_ms')->nullable();
            $table->text('error_message')->nullable();

            $table->unsignedTinyInteger('attempt')->default(0);
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['reference_type', 'reference_id']);
            $table->index(['status', 'created_at']);
            $table->index('trigger_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mes_integration_logs');
    }
};
