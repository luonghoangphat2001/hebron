<?php

namespace App\Jobs;

use App\Enums\ExcelHistoryStatus;
use App\Exports\MyPage\MyPageOrderHistoryExport;
use App\Models\ExportHistory;
use App\Services\MyPage\MyPageOrderHistoryExportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class GenerateMyPageOrderHistoryExport implements ShouldQueue
{
    use Queueable;

    public int $tries;

    public int $timeout;

    public function __construct(public readonly int $historyId)
    {
        $this->tries = config('exports.tries');
        $this->timeout = config('exports.timeout');
    }

    public function handle(): void
    {
        $history = ExportHistory::query()
            ->whereKey($this->historyId)
            ->where('module', MyPageOrderHistoryExportService::MODULE)
            ->first();

        if (! $history || $history->status !== ExcelHistoryStatus::PROCESSING) {
            return;
        }

        try {
            $stored = Excel::store(
                new MyPageOrderHistoryExport($history->user_id, $history->filters ?? []),
                $history->file_path,
                config('filesystems.public_disk'),
            );

            if (! $stored) {
                throw new \RuntimeException('Excel file could not be stored.');
            }

            $history->update(['status' => ExcelHistoryStatus::COMPLETED->value]);
        } catch (\Throwable $exception) {
            $history->update(['status' => ExcelHistoryStatus::FAILED->value]);

            Log::error('MyPage order-history export failed.', [
                'history_id' => $history->id,
                'user_id' => $history->user_id,
                'exception' => $exception,
            ]);
        }
    }
}
