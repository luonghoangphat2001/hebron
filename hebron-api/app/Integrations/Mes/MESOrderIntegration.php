<?php

namespace App\Integrations\Mes;

use App\Enums\MesReferenceType;
use App\Enums\MesTriggerType;

class MESOrderIntegration extends MesClient
{
    public function registerOrderFromMall(array $orderData, int $referentId): array
    {
        $payload = [
            'orderInfo' => [
                'sid' => $orderData['sid'] ?? '',
                'order_id' => $orderData['order_id'],
                'send_name' => $orderData['send_name'],
                'send_hphone' => $orderData['send_hphone'],
                'order_date' => $orderData['order_date'],
                'recive_date' => $orderData['recive_date'] ?? '',
                'demand' => $orderData['demand'] ?? '',
                'total_price' => $orderData['total_price'],
            ],
            'productInfo' => $orderData['productInfo'] ?? [],
        ];

        return $this->post('order_fromMall.php', $payload, $referentId, 'order registration', MesTriggerType::OrderCreated);
    }

    public function confirmDesignFromMall(string $orderId, int $referentId): array
    {
        return $this->post('confirm_fromMall.php', ['order_id' => $orderId], $referentId, 'design confirmation', MesTriggerType::ConfirmDesign);
    }

    public function stockInfo(string $sid, string $stockRequestNo, ?int $referentId = null, ?string $productCode = null): array
    {
        $payload = [
            'sid' => $sid,
            'stock_request_no' => $stockRequestNo,
        ];

        if ($productCode !== null && $productCode !== '') {
            $payload['product_code'] = $productCode;
            $payload['prdname'] = $productCode;
        }

        return $this->post('stock_info.php', $payload, $referentId, 'stock info', MesTriggerType::StockInfo, MesReferenceType::Inventory);
    }
}
