<?php

namespace App\Migration\Inquiry\Transformers;

use App\Migration\Inquiry\DTO\InquiryImportData;
use App\Migration\Shared\Exceptions\InquiryImportException;

class InquiryTransformer
{
    /**
     * Transform a raw Cafe24 article into an inquiry DTO.
     *
     * @param  array<string, mixed>  $article
     */
    public function transform(array $article): InquiryImportData
    {
        $articleNo = (int) ($article['article_no'] ?? 0);
        if ($articleNo <= 0) {
            throw new InquiryImportException('Article is missing a valid article_no.', $articleNo);
        }

        $rawParent = $article['parent_article_no'] ?? null;
        $legacyParentArticleNo = ($rawParent !== null && $rawParent !== '')
            ? (int) $rawParent
            : null;

        return new InquiryImportData(
            legacyArticleNo: $articleNo,
            legacyParentArticleNo: $legacyParentArticleNo,
            boardNo: (int) ($article['board_no'] ?? 0),
            productNo: $this->stringOrNull($article['product_no'] ?? null),
            boardCategoryNo: (int) ($article['board_category_no'] ?? 0),
            replySequence: (int) ($article['reply_sequence'] ?? 0),
            replyDepth: (int) ($article['reply_depth'] ?? 0),
            createdDate: (string) ($article['created_date'] ?? now()->toIso8601String()),
            writer: (string) ($article['writer'] ?? 'Unknown'),
            writerEmail: $this->stringOrNull($article['writer_email'] ?? null),
            memberId: (string) ($article['member_id'] ?? ''),
            title: (string) ($article['title'] ?? ''),
            content: (string) ($article['content'] ?? ''),
            supplierId: $this->stringOrNull($article['supplier_id'] ?? null),
            clientIp: (string) ($article['client_ip'] ?? ''),
            replyMail: (string) ($article['reply_mail'] ?? 'N'),
            display: (string) ($article['display'] ?? 'F'),
            secret: (string) ($article['secret'] ?? 'F'),
            notice: (string) ($article['notice'] ?? 'F'),
            fixed: (string) ($article['fixed'] ?? 'F'),
            deleted: (string) ($article['deleted'] ?? 'F'),
            inputChannel: (string) ($article['input_channel'] ?? 'P'),
            orderId: $this->stringOrNull($article['order_id'] ?? null),
            hit: (int) ($article['hit'] ?? 0),
            reply: (string) ($article['reply'] ?? 'F'),
            replyUserId: $this->stringOrNull($article['reply_user_id'] ?? null),
            replyStatus: $this->stringOrNull($article['reply_status'] ?? null),
            attachFileUrls: is_array($article['attach_file_urls'] ?? null)
                ? $article['attach_file_urls']
                : [],
            rawArticle: $article,
        );
    }

    protected function stringOrNull(mixed $value): ?string
    {
        if ($value === null || is_array($value) || is_object($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
