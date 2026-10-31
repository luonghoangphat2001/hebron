<?php

namespace App\Services\MyPage;

use App\Enums\ExcelHistoryStatus;
use App\Jobs\GenerateMyPageOrderHistoryExport;
use App\Models\ExportHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class MyPageOrderHistoryExportService
{
    public const MODULE = 'mypage-order-history';

    /** @param array<string, mixed> $filters */
    public function request(User $user, array $filters): ExportHistory
    {
        $exportConfig = config('exports.mypage_order_history');
        $fileName = $exportConfig['filename_prefix'].'_'.now()->format('Y-m-d_H-i-s').'_'.Str::lower(Str::random($exportConfig['random_suffix_length'])).'.xlsx';
        $filePath = sprintf('%s/%d/%s', $exportConfig['path'], $user->id, $fileName);

        $history = ExportHistory::create([
            'user_id' => $user->id,
            'module' => self::MODULE,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'status' => ExcelHistoryStatus::PROCESSING->value,
            'filters' => $filters,
        ]);

        GenerateMyPageOrderHistoryExport::dispatch($history->id)->onQueue(config('exports.queue'));

        return $history;
    }

    public function getForUser(User $user, int $historyId): ExportHistory
    {
        $history = ExportHistory::query()
            ->whereKey($historyId)
            ->where('user_id', $user->id)
            ->where('module', self::MODULE)
            ->first();

        if (! $history) {
            throw new ModelNotFoundException('Export history not found.');
        }

        return $history;
    }
}
