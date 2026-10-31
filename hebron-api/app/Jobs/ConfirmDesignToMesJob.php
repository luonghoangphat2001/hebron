<?php

namespace App\Jobs;

use App\Integrations\Mes\MESOrderIntegration;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ConfirmDesignToMesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected Order $order) {}

    /**
     * Execute the job.
     */
    public function handle(): array
    {
        $integration = new MESOrderIntegration();
        return $integration->confirmDesignFromMall($this->order->order_number, $this->order->id);
    }

    /**
     * Get the unique ID for this job.
     */
    public function uniqueId(): string
    {
        return 'confirm-design-' . $this->order->id;
    }
}