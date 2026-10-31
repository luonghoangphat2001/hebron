<?php

namespace App\Migration\Notice\Transformers;

use App\Enums\NoticeType;
use App\Migration\Notice\DTO\NoticeImportData;
use App\Migration\Shared\Exceptions\NoticeImportException;

class NoticeTransformer
{
    public function transform(array $article): NoticeImportData
    {
        $articleNo = (int) ($article['article_no'] ?? 0);
        if ($articleNo <= 0) {
            throw new NoticeImportException('Article is missing a valid article_no.', $articleNo);
        }

        $attachments = $this->transformAttachments($article['attach_file_urls'] ?? []);

        return new NoticeImportData(
            legacyArticleNo: $articleNo,
            boardCategoryNo: (int) ($article['board_category_no'] ?? 0),
            title: (string) ($article['title'] ?? ''),
            content: (string) ($article['content'] ?? ''),
            type: NoticeType::GENERAL->value,
            isPinned: ($article['notice'] ?? 'F') === 'T' || ($article['fixed'] ?? 'F') === 'T',
            display: ($article['display'] ?? 'F') === 'T',
            hit: (int) ($article['hit'] ?? 0),
            createdDate: (string) ($article['created_date'] ?? now()->toIso8601String()),
            writer: (string) ($article['writer'] ?? 'Unknown'),
            attachments: $attachments,
            rawArticle: $article,
        );
    }

    protected function transformAttachments(array $attachFileUrls): ?array
    {
        if (empty($attachFileUrls)) {
            return null;
        }

        return array_map(function ($file) {
            $url = $file['url'] ?? '';
            if (str_starts_with($url, '//')) {
                $url = 'https:'.$url;
            }

            return [
                'no' => $file['no'] ?? null,
                'name' => $file['name'] ?? '',
                'url' => $url,
            ];
        }, $attachFileUrls);
    }
}
