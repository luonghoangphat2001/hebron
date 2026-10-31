<?php

namespace App\Services\Admin;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Enums\PaperCategory;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\Paper;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminPaperService
{
    /**
     * Get paginated list of papers with filters.
     */
    public function getPapers(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Paper::with(['creator'])
            ->where(function ($q) use ($filters) {
                if (isset($filters['category']) && ! empty($filters['category'])) {
                    $q->where('category', '=', $filters['category']);
                }
                if (isset($filters['manufacturer']) && ! empty($filters['manufacturer'])) {
                    $q->where('manufacturer', 'like', '%' . $filters['manufacturer'] . '%');
                }
                if (isset($filters['name']) && ! empty($filters['name'])) {
                    $q->where('name', 'like', '%' . $filters['name'] . '%');
                }
                if (isset($filters['is_active'])) {
                    $isActive = $filters['is_active'] === 'true' ? true : false;
                    $q->where('is_active', $isActive);
                }
            })
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Get a single paper by ID.
     */
    public function getPaper(int $id): Paper
    {
        return Paper::with(['creator'])
            ->where('id', $id)
            ->firstOrFail();
    }

    /**
     * Create a new paper.
     */
    public function createPaper(User $user, array $data): Paper
    {
        if (isset($data['is_active'])) {
            $data['is_active'] = $data['is_active'] === 'active';
            unset($data['status']);
        }

        return DB::transaction(function () use ($user, $data) {
            $paper = Paper::create([
                ...$data,
                'created_by' => $user->id,
            ]);

            $this->syncErpOptions($paper);

            return $paper->refresh();
        });
    }

    /**
     * Update an existing paper.
     */
    public function updatePaper(int $id, array $data): Paper
    {
        return DB::transaction(function () use ($id, $data) {
            $paper = $this->getPaper($id);
            $paper->fill($data);
            $paper->save();

            $this->syncErpOptions($paper);

            return $paper->refresh();
        });
    }

    /**
     * Sync ERP options for the paper.
     */
    public function syncErpOptions(Paper $paper): void
    {
        $erpOptionGroup = ErpOptionGroup::firstOrCreate([
            'code' => ErpOptionGroupCode::PAPER->value,
        ], [
            'label' => 'Paper',
            'type' => ErpOptionGroupType::PAPER,
            'display_type' => 'select',
            'is_required' => true,
            'sort_order' => 1,
        ]);

        $existingOption = ErpOption::where('paper_id', $paper->id)
            ->where('erp_option_group_id', $erpOptionGroup->id)
            ->first();

        if ($existingOption) {
            $existingOption->update([
                'label' => $paper->name,
                'value' => (string) $paper->id,
                'attributes' => [
                    'category' => $paper->category,
                    'manufacturer' => $paper->manufacturer,
                ],
                'is_active' => $paper->is_active,
            ]);
        } else {
            ErpOption::create([
                'erp_option_group_id' => $erpOptionGroup->id,
                'paper_id' => $paper->id,
                'label' => $paper->name,
                'code' => 'paper_' . $paper->id,
                'value' => (string) $paper->id,
                'attributes' => [
                    'category' => $paper->category,
                    'manufacturer' => $paper->manufacturer,
                ],
                'is_active' => $paper->is_active,
            ]);
        }
    }

    /**
     * Delete a paper.
     */
    public function deletePaper(int $id): void
    {
        DB::transaction(function () use ($id) {
            $paper = $this->getPaper($id);
            $paper->delete();
        });
    }

    /**
     * Get all active papers.
     */
    public function getActivePapers(): Collection
    {
        return Paper::where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
