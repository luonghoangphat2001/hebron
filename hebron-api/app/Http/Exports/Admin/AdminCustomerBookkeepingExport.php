<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminCustomerService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminCustomerBookkeepingExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function collection()
    {
        $customerId = (int) Arr::get($this->filters, 'customer_id');
        $service = app(AdminCustomerService::class);
        $data = $service->getBookkeeping($customerId, $this->filters);

        $rows = collect();

        foreach ($data['members'] as $member) {
            foreach ($member['transactions'] as $tx) {
                $rows->push([
                    'member_name' => $member['name'],
                    'member_username' => $member['username'],
                    'contact_phone' => $member['contact_phone'],
                    'limit' => $member['limit'],
                    'usage_amount' => $member['usage_amount'],
                    'remaining_amount' => $member['remaining_amount'],
                    'tx_id' => $tx['id'],
                    'tx_date' => $tx['date'],
                    'tx_description' => $tx['description'],
                    'tx_usage_amount' => $tx['usage_amount'],
                    'tx_remaining_amount' => $tx['remaining_amount'],
                    'tx_reference_type' => $tx['reference_type'],
                    'tx_reference_id' => $tx['reference_id'],
                ]);
            }

            if (empty($member['transactions'])) {
                $rows->push([
                    'member_name' => $member['name'],
                    'member_username' => $member['username'],
                    'contact_phone' => $member['contact_phone'],
                    'limit' => $member['limit'],
                    'usage_amount' => $member['usage_amount'],
                    'remaining_amount' => $member['remaining_amount'],
                    'tx_id' => null,
                    'tx_date' => null,
                    'tx_description' => null,
                    'tx_usage_amount' => null,
                    'tx_remaining_amount' => null,
                    'tx_reference_type' => null,
                    'tx_reference_id' => null,
                ]);
            }
        }

        return $rows;
    }

    public function map($row): array
    {
        return [
            $row['member_name'],
            $row['member_username'],
            $row['contact_phone'],
            $row['limit'],
            $row['usage_amount'],
            $row['remaining_amount'],
            $row['tx_id'],
            $row['tx_date'],
            $row['tx_description'],
            $row['tx_usage_amount'],
            $row['tx_remaining_amount'],
            $row['tx_reference_type'],
            $row['tx_reference_id'],
        ];
    }

    public function headings(): array
    {
        return [
            '이름',
            'ID',
            '연락처',
            '한도',
            '사용 금액',
            '잔여 금액',
            '번호',
            '일자',
            '상세 내용',
            '결제 금액',
            '사용 금액',
            '참조 유형',
            '참조 ID',
        ];
    }

    public function title(): string
    {
        return '장부';
    }
}
