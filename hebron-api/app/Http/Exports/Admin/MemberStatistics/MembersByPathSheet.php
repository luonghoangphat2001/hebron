<?php

namespace App\Http\Exports\Admin\MemberStatistics;

use App\Services\Admin\AdminMemberStatisticsService;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class MembersByPathSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected AdminMemberStatisticsService $adminMemberStatisticsService;

    protected array $filters;

    public function __construct(
        AdminMemberStatisticsService $adminMemberStatisticsService,
        array $filters
    ) {
        $this->adminMemberStatisticsService = $adminMemberStatisticsService;
        $this->filters = $filters;
    }

    public function collection()
    {
        $data = $this->adminMemberStatisticsService->getMembersByPath($this->filters);

        return collect($data);
    }

    public function headings(): array
    {
        return ['회원 ID', '회원명', '가입 경로', '회원 수'];
    }

    public function map($item): array
    {
        return [
            $item['user_id'],
            $item['user_name'],
            $item['path'],
            $item['count'],
        ];
    }

    public function title(): string
    {
        return '가입 경로별 회원';
    }
}
