<?php

namespace App\Migration\Inquiry\Importers;

use App\Enums\InquiryStatus;
use App\Migration\Inquiry\DTO\InquiryImportData;
use App\Migration\Shared\Exceptions\InquiryImportException;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\InquiryComment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class InquiryImporter
{
    public function __construct() {}

    public function import(InquiryImportData $dto): Inquiry
    {
        $dryRun = (bool) config('migration.dry_run', false);

        if ($dryRun) {
            Log::info('[dry-run] InquiryImporter::import', [
                'legacy_article_no' => $dto->legacyArticleNo,
            ]);
            return new Inquiry(['id' => 0]);
        }

        try {
            return DB::transaction(function () use ($dto) {
                return $this->upsertInquiry($dto);
            });
        } catch (Throwable $e) {
            Log::error('InquiryImporter: failed', [
                'legacy_article_no' => $dto->legacyArticleNo,
                'error' => $e->getMessage(),
            ]);
            throw new InquiryImportException(
                sprintf('Failed to import inquiry %d: %s', $dto->legacyArticleNo, $e->getMessage()),
                $dto->legacyArticleNo,
                $e,
            );
        }
    }

    /**
     * Import a reply as InquiryComment and update parent inquiry status.
     */
    public function importReply(InquiryImportData $dto): void
    {
        $inquiry = Inquiry::where('legacy_article_no', $dto->legacyParentArticleNo)->first();

        if (! $inquiry) {
            Log::warning('InquiryMigrationService: parent inquiry not found', [
                'legacy_article_no' => $dto->legacyArticleNo,
                'legacy_parent_article_no' => $dto->legacyParentArticleNo,
            ]);

            return;
        }
        
        $isAdminReply = $dto->memberId == config('migration.pagination.inquiries.admin_member', 'hebron21');

        InquiryComment::updateOrCreate(
            [
                'inquiry_id' => $inquiry->id,
                'legacy_article_no' => $dto->legacyArticleNo,
            ],
            [
                'author_name' => $dto->writer,
                'content' => $this->stripHtml($dto->content),
                'is_admin' => $isAdminReply,
                'legacy_data' => $dto,
            ],
        );

        if ($isAdminReply) {
            $inquiry->update([
                'reply_content' => $this->stripHtml($dto->content),
                'status' => InquiryStatus::RESPONDED,
            ]);
        }

        Log::info('Inquiry reply imported', [
            'legacy_article_no' => $dto->legacyArticleNo,
            'inquiry_id' => $inquiry->id,
        ]);
    }
    protected function stripHtml(string $html): string
    {
        return strip_tags($html, '<br><p><ul><ol><li>');
    }
    protected function upsertInquiry(InquiryImportData $dto): Inquiry
    {
        $inquiry = Inquiry::updateOrCreate(
            ['legacy_article_no' => $dto->legacyArticleNo],
            [
                'title' => $dto->title,
                'content' => $dto->content,
                'contact' => $dto->writerEmail ?: $dto->writer,
                'status' => $dto->reply == "T"? InquiryStatus::RESPONDED: InquiryStatus::PENDING,
                'legacy_data' => $dto,
            ],
        );

        if (! empty($dto->attachFileUrls)) {
            $this->upsertAttachments($inquiry, $dto->attachFileUrls, false);
        }

        Log::info('Inquiry imported', [
            'legacy_article_no' => $dto->legacyArticleNo,
            'inquiry_id' => $inquiry->id,
        ]);

        return $inquiry;
    }

    protected function upsertAttachments(Inquiry $inquiry, array $urls, bool $isReplyAttachment): void
    {
        foreach ($urls as $url) {
            if (empty($url)) continue;

            InquiryAttachment::updateOrCreate(
                [
                    'inquiry_id' => $inquiry->id,
                    'file_path' => $url,
                ],
                [
                    'file_name' => basename($url),
                    'file_type' => pathinfo($url, PATHINFO_EXTENSION) ?: null,
                    'file_size' => null,
                    'is_reply_attachment' => $isReplyAttachment,
                ],
            );
        }
    }
}
