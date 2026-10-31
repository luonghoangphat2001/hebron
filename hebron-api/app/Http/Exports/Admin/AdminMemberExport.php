<?php

namespace App\Http\Exports\Admin;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use App\Helpers\ExportLocaleHelper;
use App\Http\Exports\Concerns\RestrictsCurrentPage;
use App\Services\Admin\AdminMemberService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminMemberExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable, RestrictsCurrentPage;

    protected array $filters;

    protected AdminMemberService $adminMemberService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminMemberService = app(AdminMemberService::class);
        $this->locale = Arr::get($filters, 'locale', 'ko');
    }

    public function query()
    {
        $query = $this->adminMemberService->buildQuery($this->filters);

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
                    $query->whereIn('users.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($member): array
    {
        $locale = $this->locale;

        $statusLabels = [
            'en' => [
                UserStatus::ACTIVE->value => 'Active',
                UserStatus::INACTIVE->value => 'Inactive',
                UserStatus::BLOCKED->value => 'Blocked',
                UserStatus::WITHDRAWN->value => 'Withdrawn',
            ],
            'ko' => [
                UserStatus::ACTIVE->value => '활성',
                UserStatus::INACTIVE->value => '비활성',
                UserStatus::BLOCKED->value => '차단',
                UserStatus::WITHDRAWN->value => '탈퇴',
            ],
            'ja' => [
                UserStatus::ACTIVE->value => '有効',
                UserStatus::INACTIVE->value => '無効',
                UserStatus::BLOCKED->value => 'ブロック',
                UserStatus::WITHDRAWN->value => '退会',
            ],
        ];
        $status = $member->status
            ? ($statusLabels[$locale][$member->status->value] ?? '해당 없음')
            : '해당 없음';

        return [
            $member->id,
            $member->username,
            $member->name,
            $member->email,
            $member->phone,
            $member->mobile,
            $this->getAuthorityLabel($member->authority),
            $status,
            $member->company_name,
            $member->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getMemberHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getMemberSheetName($this->locale);
    }

    private function getAuthorityLabel(?string $authority): string
    {
        return UserAuthority::tryFromString($authority)?->getLabel()
            ?? match ($authority) {
                'staff' => '직원',
                default => $authority ?? '해당 없음',
            };
    }
}
