<?php

namespace App\Services\Admin;

use App\Models\Equipment;
use App\Models\EquipmentLog;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEquipmentService
{
    public function getList(?string $searchType, ?string $keyword, ?string $workProcess, ?string $status, int $perPage): LengthAwarePaginator
    {
        $query = Equipment::query();

        if ($keyword) {
            $field = in_array($searchType, ['company_name', 'name', 'work_type']) ? $searchType : 'name';
            $query->where($field, 'like', "%{$keyword}%");
        }

        if ($workProcess !== null) {
            $query->where('work_process', $workProcess);
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): Equipment
    {
        return Equipment::findOrFail($id);
    }

    public function create(array $data): Equipment
    {
        return Equipment::create($data);
    }

    public function update(int $id, array $data): Equipment
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->update(array_filter($data, fn ($v) => $v !== null));

        return $equipment->fresh();
    }

    /**
     * @throws ModelNotFoundException
     */
    public function delete(int $id): void
    {
        Equipment::findOrFail($id)->delete();
    }

    public function getLogs(int $equipmentId): \Illuminate\Database\Eloquent\Collection
    {
        Equipment::findOrFail($equipmentId);

        return EquipmentLog::where('equipment_id', $equipmentId)
            ->orderBy('log_date', 'desc')
            ->get();
    }

    public function createLog(int $equipmentId, array $data): EquipmentLog
    {
        Equipment::findOrFail($equipmentId);

        return EquipmentLog::create(['equipment_id' => $equipmentId, ...$data]);
    }

    /**
     * @throws ModelNotFoundException
     */
    public function deleteLog(int $equipmentId, int $logId): void
    {
        $log = EquipmentLog::where('equipment_id', $equipmentId)->findOrFail($logId);
        $log->delete();
    }
}
