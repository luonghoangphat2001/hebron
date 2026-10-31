<?php

namespace App\Http\Resources;

use App\Enums\ExcelHistoryStatus;
use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyPageExportHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof ExcelHistoryStatus ? $this->status : ExcelHistoryStatus::tryFrom((string) $this->status);
        $completed = $status === ExcelHistoryStatus::COMPLETED;

        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'status' => $status?->value,
            'download_url' => $completed ? FileStorage::publicUrl($this->file_path) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
