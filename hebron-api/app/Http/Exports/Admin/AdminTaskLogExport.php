<?php

namespace App\Http\Exports\Admin;

use App\Enums\TaskType;
use App\Http\Exports\Concerns\RestrictsCurrentPage;
use App\Services\Admin\AdminTaskLogService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Spatie\Activitylog\Models\Activity;

class AdminTaskLogExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable, RestrictsCurrentPage;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = Activity::query()->with(['causer', 'subject']);

        // Apply filters similar to AdminTaskLogService::getTaskLogs
        $menu = Arr::get($this->filters, 'menu');
        if ($menu) {
            $query->where('log_name', $menu);
        }

        $workerName = Arr::get($this->filters, 'worker_name');
        if ($workerName) {
            $query->where('causer_type', 'App\Models\User')
                ->whereHas('causer', function ($q) use ($workerName) {
                    $q->where(function ($inner) use ($workerName) {
                        $inner->where('name', 'like', '%'.$workerName.'%')
                            ->orWhere('username', 'like', '%'.$workerName.'%')
                            ->orWhere('email', 'like', '%'.$workerName.'%');
                    });
                });
        }

        // Map FE enum (register, modify, delete, approval) to BE event (created, updated, deleted, approved)
        $taskType = Arr::get($this->filters, 'task_type');
        if ($taskType) {
            try {
                $taskTypeEnum = TaskType::from($taskType);
                $event = $taskTypeEnum->toEvent();
                $query->where('event', $event);
            } catch (\ValueError $e) {
                // Invalid task type, skip filter
            }
        }

        $dateFrom = Arr::get($this->filters, 'date_from');
        $dateTo = Arr::get($this->filters, 'date_to');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $subjectType = Arr::get($this->filters, 'subject_type');
        if ($subjectType) {
            $query->where('subject_type', $subjectType);
        }

        $query->orderBy('created_at', 'desc');

        $exportType = Arr::get($this->filters, 'export_type', 'ALL');
        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $this->restrictToCurrentPage($query, $currentPage, $perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($activity): array
    {
        $service = app(AdminTaskLogService::class);
        $parsed = $service->parseActivityProperties($activity);

        // Map BE event (created, updated, deleted, approved) to FE enum (register, modify, delete, approval)
        $taskTypeEnum = TaskType::fromEvent($activity->event ?? '');
        $taskTypeValue = $taskTypeEnum?->value ?? ($activity->event ?? 'unknown');

        $workerName = $activity->causer
            ? ($activity->causer->name ?? $activity->causer->username ?? $activity->causer->email ?? 'N/A')
            : '시스템';

        $targetMenu = $activity->subject_type ? class_basename($activity->subject_type) : '해당 없음';
        $dataIdentifier = $activity->subject_id ?? '해당 없음';

        $changedFields = $this->formatChangedFields($parsed['changed_fields'] ?? []);

        $beforeValues = $this->encodeValues($parsed['before_values'] ?? []);
        $afterValues = $this->encodeValues($parsed['after_values'] ?? []);

        return [
            $activity->id,
            $activity->log_name ?? '시스템',
            $taskTypeValue,
            $workerName,
            $targetMenu,
            $dataIdentifier,
            $changedFields,
            $beforeValues,
            $afterValues,
            $activity->description,
            $activity->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'ID',
            '메뉴',
            '작업 유형',
            '작업자',
            '대상 메뉴',
            '데이터 식별자',
            '변경 항목',
            '변경 전 값',
            '변경 후 값',
            '설명',
            '생성일시',
        ];
    }

    /**
     * @param  array<int, array{value?: string, label?: array<string, string>}|string>  $changedFields
     */
    private function formatChangedFields(array $changedFields): string
    {
        $locale = Arr::get($this->filters, 'locale', 'ko');

        return collect($changedFields)
            ->map(function (array|string $field) use ($locale): string {
                if (is_string($field)) {
                    return $field;
                }

                return $field['label'][$locale]
                    ?? $field['label']['ko']
                    ?? $field['value']
                    ?? '';
            })
            ->filter()
            ->implode(', ');
    }

    private function encodeValues(array $values): string
    {
        if ($values === []) {
            return '';
        }

        return json_encode(
            $values,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
        ) ?: '';
    }
}
