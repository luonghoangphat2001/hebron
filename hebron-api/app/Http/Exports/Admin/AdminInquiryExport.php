<?php

namespace App\Http\Exports\Admin;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Helpers\ExportLocaleHelper;
use App\Http\Exports\Concerns\RestrictsCurrentPage;
use App\Services\Admin\AdminInquiryService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminInquiryExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable, RestrictsCurrentPage;

    protected array $filters;

    protected AdminInquiryService $adminInquiryService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminInquiryService = app(AdminInquiryService::class);
        $this->locale = Arr::get($filters, 'locale', 'ko');
    }

    public function query()
    {
        $query = $this->adminInquiryService->buildQuery($this->filters);

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
                    $query->whereIn('inquiries.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($inquiry): array
    {
        $locale = $this->locale;

        $inquiryTypeLabels = [
            'en' => [
                InquiryCategory::PRODUCT->value => 'Product Inquiry',
                InquiryCategory::PAYMENT->value => 'Payment Inquiry',
                InquiryCategory::SHIPPING->value => 'Shipping/Delivery Inquiry',
            ],
            'ko' => [
                InquiryCategory::PRODUCT->value => '상품문의',
                InquiryCategory::PAYMENT->value => '결제문의',
                InquiryCategory::SHIPPING->value => '출고/배송문의',
            ],
            'ja' => [
                InquiryCategory::PRODUCT->value => '商品問い合わせ',
                InquiryCategory::PAYMENT->value => '決済問い合わせ',
                InquiryCategory::SHIPPING->value => '出荷・配送に関するお問い合わせ',
            ],
        ];
        $inquiryType = $inquiry->category
            ? ($inquiryTypeLabels[$locale][$inquiry->category->value] ?? $inquiry->category->label())
            : '';

        $statusLabels = [
            'en' => [
                InquiryStatus::PENDING->value => 'Pending',
                InquiryStatus::RESPONDED->value => 'Responded',
            ],
            'ko' => [
                InquiryStatus::PENDING->value => '답변 대기',
                InquiryStatus::RESPONDED->value => '답변 완료',
            ],
            'ja' => [
                InquiryStatus::PENDING->value => '回答待ち',
                InquiryStatus::RESPONDED->value => '回答完了',
            ],
        ];
        $status = $inquiry->status
            ? ($statusLabels[$locale][$inquiry->status->value] ?? $inquiry->status->label())
            : '';

        $hasAttachmentLabels = [
            'en' => ['Yes', 'No'],
            'ko' => ['예', '아니오'],
            'ja' => ['はい', 'いいえ'],
        ];
        $hasAttachment = $inquiry->attachments_count > 0
            ? ($hasAttachmentLabels[$locale][0] ?? '있음')
            : ($hasAttachmentLabels[$locale][1] ?? '없음');

        $personInCharge = $inquiry->repliedBy?->name ?? '';

        return [
            $inquiry->id,
            $inquiry->inquiry_number,
            $inquiryType,
            $inquiry->title,
            $inquiry->user?->company_name ?? $inquiry->company_name ?? '',
            $inquiry->user?->name ?? $inquiry->manager_name ?? '',
            $status,
            $personInCharge,
            $hasAttachment,
            $inquiry->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getInquiryHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getInquirySheetName($this->locale);
    }
}
