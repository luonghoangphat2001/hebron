<?php

namespace App\Services\Admin;

use App\Enums\MesIntegrationStatus;
use App\Models\MesIntegrationLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminMesIntegrationLogService
{
    /**
     * Get integration logs
     */
    public function getLogs(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = MesIntegrationLog::query();

        if (!empty($filters['direction'])) {
            $query->where('direction', $filters['direction']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['trigger_type'])) {
            $query->where('trigger_type', $filters['trigger_type']);
        }
        if (!empty($filters['keyword'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('endpoint', 'like', '%' . $filters['keyword'] . '%')
                  ->orWhere('error_message', 'like', '%' . $filters['keyword'] . '%');
            });
        }
        if (!empty($filters['start_date'])) {
            $query->whereDate('requested_at', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('requested_at', '<=', $filters['end_date']);
        }

        return $query->latest('requested_at')->paginate($perPage);
    }

    /**
     * Get integration log detail
     */
    public function getLog(int $id): MesIntegrationLog
    {
        return MesIntegrationLog::findOrFail($id);
    }

    /**
     * Get integration log dashboard statistics
     */
    public function getDashboardStats(): array
    {
        $today = now()->startOfDay();
        $logsToday = MesIntegrationLog::where('created_at', '>=', $today);
        $totalToday = $logsToday->count();
        $failedToday = (clone $logsToday)->where('status', \App\Enums\MesIntegrationStatus::Failed)->count();

        $lastLog = MesIntegrationLog::latest('requested_at')->first();
        
        $avgResponseTime = MesIntegrationLog::whereNotNull('duration_ms')
            ->avg('duration_ms');

        return [
            'connection_status' => $this->checkConnection(),
            'last_sync_time' => $lastLog?->requested_at?->format('Y-m-d H:i:s'),
            'response_time' => round((float)$avgResponseTime),
            'success_rate' => $totalToday > 0 ? round((($totalToday - $failedToday) / $totalToday) * 100) : 100,
            'failed_requests_today' => $failedToday,
            'total_requests_today' => $totalToday,
        ];
    }

    private function checkConnection(): string
    {
        // Simple connectivity check - if logs exist within last 1 hour, assume connected
        $recentLog = MesIntegrationLog::where('created_at', '>=', now()->subHour())->first();
        return $recentLog ? 'Connected' : 'Disconnected';
    }
}
