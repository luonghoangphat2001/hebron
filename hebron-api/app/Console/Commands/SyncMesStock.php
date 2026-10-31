<?php

namespace App\Console\Commands;

use App\Services\MesStockService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncMesStock extends Command
{
    protected $signature = 'mes:sync-stock';

    protected $description = 'Synchronize product stock quantities from MES';

    public function __construct(
        protected MesStockService $mesStockService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starting MES stock synchronization...');

        try {
            $result = $this->mesStockService->syncStock();
        } catch (\Throwable $e) {
            Log::error('Scheduled MES stock synchronization failed', [
                'error' => $e->getMessage(),
                'exception' => $e,
            ]);
            $this->error('MES stock synchronization failed: '.$e->getMessage());

            return self::FAILURE;
        }

        if (! ($result['success'] ?? false)) {
            $this->error($result['message'] ?? 'MES stock synchronization failed.');

            return self::FAILURE;
        }

        $data = $result['data'] ?? [];
        $this->info(sprintf(
            'MES stock synchronization completed. Synced: %d, skipped: %d, not found: %d.',
            (int) ($data['synced_count'] ?? 0),
            (int) ($data['skipped_count'] ?? 0),
            (int) ($data['not_found_count'] ?? 0),
        ));

        return self::SUCCESS;
    }
}
