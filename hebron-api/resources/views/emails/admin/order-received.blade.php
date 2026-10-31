<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 30px auto; padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: bold; color: #111827; }
        .sub-title { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 15px; font-weight: bold; color: #1f2937; margin-bottom: 12px; border-left: 4px solid #3b82f6; padding-left: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .table th, .table td { padding: 10px 12px; text-align: left; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f3f4f6; color: #4b5563; font-weight: 600; width: 30%; }
        .table td { color: #111827; }
        .price { font-weight: bold; color: #dc2626; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">[Hebron] 신규 주문 접수 알림</div>
            <div class="sub-title">새로운 주문이 접수되었습니다. 관리자 페이지에서 확인해 주세요.</div>
        </div>

        <div class="section">
            <div class="section-title">주문 정보</div>
            <table class="table">
                <tr>
                    <th>주문번호</th>
                    <td><strong>{{ $order->order_number }}</strong></td>
                </tr>
                <tr>
                    <th>주문일시</th>
                    <td>{{ $order->placed_at ? $order->placed_at->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s') }}</td>
                </tr>
                <tr>
                    <th>결제수단</th>
                    <td>{{ is_object($order->payment_method) && method_exists($order->payment_method, 'label') ? $order->payment_method->label() : (string) $order->payment_method }}</td>
                </tr>
                <tr>
                    <th>총 결제금액</th>
                    <td class="price">{{ number_format($order->total_amount) }}원</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">주문자 정보</div>
            <table class="table">
                <tr>
                    <th>고객명</th>
                    <td>{{ $order->contact_name ?: ($order->user?->name ?? '비회원') }}</td>
                </tr>
                <tr>
                    <th>연락처</th>
                    <td>{{ $order->contact_phone ?: ($order->user?->phone ?? '-') }}</td>
                </tr>
                <tr>
                    <th>이메일</th>
                    <td>{{ $order->contact_email ?: ($order->user?->email ?? '-') }}</td>
                </tr>
            </table>
        </div>

        @if($order->items && $order->items->isNotEmpty())
        <div class="section">
            <div class="section-title">주문 상품 목록</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 55%;">상품명</th>
                        <th style="width: 20%; text-align: center;">수량</th>
                        <th style="width: 25%; text-align: right;">금액</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>{{ $item->title ?: $item->product?->name }}</td>
                        <td style="text-align: center;">{{ number_format($item->quantity) }}개</td>
                        <td style="text-align: right;">{{ number_format($item->total_amount) }}원</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <div class="footer">
            본 메일은 Hebron 쇼핑몰 시스템에서 자동으로 발송되었습니다.
        </div>
    </div>
</body>
</html>
