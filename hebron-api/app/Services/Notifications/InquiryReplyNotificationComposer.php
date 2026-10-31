<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Enums\NotificationEvent;
use App\Models\Inquiry;
use App\Models\InquiryComment;
use App\Models\NotificationDelivery;
use Illuminate\Validation\ValidationException;

class InquiryReplyNotificationComposer
{
    public function __construct(
        private readonly InquiryReplyNotificationContent $content,
    ) {}

    /**
     * @param  array<int, string>  $channels
     * @return array<int, NotificationDelivery>
     */
    public function compose(Inquiry $inquiry, InquiryComment $reply, array $channels): array
    {
        $inquiry->loadMissing('user');
        $deliveries = [];
        $shopName = $this->shopName($inquiry);
        $answer = $this->content->plainText($reply->content);

        foreach (array_unique($channels) as $channel) {
            $deliveryChannel = NotificationChannel::tryFrom($channel);
            if ($deliveryChannel === null) {
                throw ValidationException::withMessages([
                    'notification_channels' => ["Unsupported notification channel: {$channel}"],
                ]);
            }

            [$name, $address] = $this->recipient($inquiry, $deliveryChannel);
            if (blank($address)) {
                throw ValidationException::withMessages([
                    'notification_channels' => ["The recipient has no {$deliveryChannel->value} address."],
                ]);
            }

            $templateCode = $deliveryChannel === NotificationChannel::KAKAO
                ? $this->requiredAligoTemplateCode($inquiry)
                : null;

            $deliveries[] = NotificationDelivery::create([
                'subject_type' => $reply::class,
                'subject_id' => $reply->id,
                'event' => NotificationEvent::INQUIRY_REPLY->value,
                'channel' => $deliveryChannel->value,
                'recipient_name' => $name,
                'recipient_address' => $address,
                'template_code' => $templateCode,
                'payload' => [
                    'mail' => [
                        'subject' => $this->content->mailSubject($shopName),
                        'greeting' => $this->content->greeting($name),
                        'lines' => [
                            '[문의 내용]',
                            $inquiry->title,
                            '[답변]',
                            $answer,
                        ],
                        'salutation' => '감사합니다. '.$shopName,
                    ],
                    'variables' => [
                        'customer_name' => $name,
                        'subject' => $inquiry->title,
                        'answer' => $answer,
                        'shopping_mall_name' => $shopName,
                    ],
                ],
                'status' => NotificationDeliveryStatus::PENDING,
            ]);
        }

        return $deliveries;
    }

    /** @return array{0: string|null, 1: string|null} */
    private function recipient(Inquiry $inquiry, NotificationChannel $channel): array
    {
        if ($inquiry->user !== null) {
            return [$inquiry->user->name, $channel === NotificationChannel::EMAIL
                ? $inquiry->user->email : $this->normalizePhone($inquiry->user->phone)];
        }

        return [
            $inquiry->manager_name ?? $inquiry->company_name,
            $channel === NotificationChannel::EMAIL ? $inquiry->email : $this->normalizePhone($inquiry->contact),
        ];
    }

    private function requiredAligoTemplateCode(Inquiry $inquiry): string
    {
        return config('services.aligo.inquiry_reply_member_template');
    }

    private function shopName(Inquiry $inquiry): string
    {
        return config('services.aligo.inquiry_shop_names.'.($inquiry->site_type ?? 'default'))
            ?? config('services.aligo.inquiry_shop_names.default', config('app.name'));
    }

    private function normalizePhone(?string $phone): ?string
    {
        $normalized = preg_replace('/\\D+/', '', (string) $phone);

        return $normalized !== '' ? $normalized : null;
    }
}
