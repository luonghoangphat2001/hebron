<?php

namespace App\Services\Notifications;

use App\Models\Order;

class OrderNotificationService extends BaseNotificationService
{
    private const DESIGN_CONFIRM_TEMPLATE = 'UK_6222';

    private const ORDER_COMPLETE_TEMPLATE = 'UB_1260';

    private const PRODUCTION_PROGRESS_TEMPLATE = 'UA_9330';

    private const BANK_TRANSFER_TEMPLATE = 'UA_9328';

    private function prepareTemplateButtons(array $template, ?string $url): array
    {
        $buttons = $template['buttons'] ?? [];

        if ($url === null) {
            return $buttons;
        }

        foreach ($buttons as &$button) {
            if (($button['linkType'] ?? null) !== 'WL') {
                continue;
            }

            $button['linkPc'] = $url;
            $button['linkMo'] = $url;
        }

        unset($button);

        return $buttons;
    }

    public function sendDesignConfirm(Order $order, ?string $url): void
    {
        $template = $this->aligoAlimTalkService->getTemplate(
            self::DESIGN_CONFIRM_TEMPLATE
        );

        $item = $order->items->first();
        $receiverPhone = $order->user?->mobile ?: ($order->contact_phone ?? '');
        $receiverName = $order->contact_name ?: ($order->user?->name ?? '고객');

        $this->send(
            templateCode: self::DESIGN_CONFIRM_TEMPLATE,
            receiver: $receiverPhone,
            recvname: $receiverName,
            variables: [
                'USER_NAME' => $receiverName,
                'SHOP_NAME' => 'hebron',
                'ORDER_NAME' => $item?->product?->name ?? $item?->title ?? '주문상품',
                'ORDERNUMBER' => $order->order_number,
                'COM_TEL' => '1566-0581',
            ],
            buttons: $this->prepareTemplateButtons($template, $url),
            template: $template,
        );
    }

    public function sendOrderComplete(Order $order, ?string $url = null): void
    {
        $template = $this->aligoAlimTalkService->getTemplate(
            self::ORDER_COMPLETE_TEMPLATE
        );

        $item = $order->items->first();
        $receiverPhone = $order->user?->mobile ?: ($order->contact_phone ?? '');
        $receiverName = $order->contact_name ?: ($order->user?->name ?? '고객');

        $this->send(
            templateCode: self::ORDER_COMPLETE_TEMPLATE,
            receiver: $receiverPhone,
            recvname: $receiverName,
            variables: [
                'USER_NAME' => $receiverName,
                'SHOP_NAME' => 'hebron',
                'PRD_NAME' => $item?->product?->name ?? $item?->title ?? '주문상품',
                'ORDERNUMBER' => $order->order_number,
            ],
            buttons: $this->prepareTemplateButtons($template, $url),
            template: $template,
        );
    }

    public function sendProductionProgress(Order $order, string $shippingCompany, string $trackingNumber, string $shippingDate): void
    {
        $template = $this->aligoAlimTalkService->getTemplate(
            self::PRODUCTION_PROGRESS_TEMPLATE
        );

        $item = $order->items->first();
        $receiverPhone = $order->user?->mobile ?: ($order->contact_phone ?? '');
        $receiverName = $order->contact_name ?: ($order->user?->name ?? '고객');

        $this->send(
            templateCode: self::PRODUCTION_PROGRESS_TEMPLATE,
            receiver: $receiverPhone,
            recvname: $receiverName,
            variables: [
                'USER_NAME' => $receiverName,
                'SHOP_NAME' => 'hebron',
                'ORDER_NAME' => $item?->product?->name ?? $item?->title ?? '주문상품',
                'SOD' => $shippingDate,
                'DEL_COM' => $shippingCompany,
                'DEL_NUM' => $trackingNumber,
            ],
            template: $template,
        );
    }

    public function sendBankTransfer(
        Order $order,
        string $bankName,
        string $accountHolder,
        string $accountNumber,
        float $totalPrice
    ): void {
        $template = $this->aligoAlimTalkService->getTemplate(
            self::BANK_TRANSFER_TEMPLATE
        );

        $receiverPhone = $order->user?->mobile ?: ($order->contact_phone ?? '');
        $receiverName = $order->contact_name ?: ($order->user?->name ?? '고객');

        $this->send(
            templateCode: self::BANK_TRANSFER_TEMPLATE,
            receiver: $receiverPhone,
            recvname: $receiverName,
            variables: [
                'SHOP_NAME' => 'hebron',
                'USER_NAME' => $receiverName,
                'BANK' => $bankName,
                'ACT_HOLDER' => $accountHolder,
                'ACT_NUM' => $accountNumber,
                'TOTAL_PRICE' => number_format($totalPrice),
            ],
            buttons: $this->prepareTemplateButtons($template, null),
            template: $template,
        );
    }

    private function replaceVariables(
        string $content,
        array $variables,
    ): string {
        return preg_replace_callback(
            '/#\{([^}]+)\}/',
            static function (array $matches) use ($variables): string {
                $key = $matches[1];

                return array_key_exists($key, $variables)
                    ? (string) $variables[$key]
                    : $matches[0];
            },
            $content,
        );
    }
}
