<?php

namespace App\Services\Admin;

use App\Models\OutsourcingCompany;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminOutsourcingService
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    public function getList(?string $searchType, ?string $keyword, ?bool $isActive, int $perPage): LengthAwarePaginator
    {
        $query = OutsourcingCompany::query();

        if ($keyword) {
            $field = in_array($searchType, ['name', 'work_details', 'representative_name', 'email', 'contact', 'address'])
                ? $searchType
                : 'name';
            $query->where($field, 'like', "%{$keyword}%");
        }

        if ($isActive !== null) {
            $query->where('is_active', $isActive);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): OutsourcingCompany
    {
        return OutsourcingCompany::findOrFail($id);
    }

    public function create(array $data): OutsourcingCompany
    {
        return OutsourcingCompany::create($data);
    }

    public function update(int $id, array $data): OutsourcingCompany
    {
        $company = OutsourcingCompany::findOrFail($id);
        $company->update(array_filter($data, fn ($v) => $v !== null));

        return $company->fresh();
    }

    /**
     * @throws ModelNotFoundException
     */
    public function delete(int $id): void
    {
        OutsourcingCompany::findOrFail($id)->delete();
    }
}
