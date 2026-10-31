<?php

namespace App\Migration\Inquiry\DTO;

readonly class InquiryImportData
{
    public function __construct(
        public int $legacyArticleNo,
        public ?int $legacyParentArticleNo,
        public int $boardNo,
        public ?string $productNo,
        public int $boardCategoryNo,
        public int $replySequence,
        public int $replyDepth,
        public string $createdDate,
        public string $writer,
        public ?string $writerEmail,
        public string $memberId,
        public string $title,
        public string $content,
        public ?string $supplierId,
        public string $clientIp,
        public string $replyMail,
        public string $display,
        public string $secret,
        public string $notice,
        public string $fixed,
        public string $deleted,
        public string $inputChannel,
        public ?string $orderId,
        public int $hit,
        public string $reply,
        public ?string $replyUserId,
        public ?string $replyStatus,
        public array $attachFileUrls,
        public array $rawArticle,
    ) {}
}
