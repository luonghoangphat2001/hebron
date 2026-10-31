<?php

namespace App\Services\Notifications;

use Illuminate\Support\Str;

class InquiryReplyNotificationContent
{
    public function plainText(string $content): string
    {
        $plainText = html_entity_decode(strip_tags($content), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $plainText = preg_replace("/\\R/u", "\n", $plainText) ?? '';
        $plainText = preg_replace("/[ \\t]+\\n/u", "\n", $plainText) ?? '';

        return trim($plainText);
    }

    public function mailSubject(string $shopName): string
    {
        return sprintf('[%s] 문의 답변 안내', $shopName);
    }

    public function greeting(?string $name): string
    {
        return sprintf('%s님, 문의하신 내용에 답변드립니다.', $name ?: '고객');
    }
}
