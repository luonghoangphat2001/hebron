<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 30px auto; padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; }
        .header { border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: bold; color: #111827; }
        .sub-title { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 15px; font-weight: bold; color: #1f2937; margin-bottom: 12px; border-left: 4px solid #10b981; padding-left: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .table th, .table td { padding: 10px 12px; text-align: left; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f3f4f6; color: #4b5563; font-weight: 600; width: 30%; }
        .table td { color: #111827; }
        .status-badge { display: inline-block; padding: 4px 10px; background: #d1fae5; color: #065f46; font-weight: bold; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">[Hebron] 고객 시안 확정 알림</div>
            <div class="sub-title">고객이 시안을 최종 확정하여 작업 대기 및 생산 단계로 이관되었습니다.</div>
        </div>

        <div class="section">
            <div class="section-title">주문 정보</div>
            <table class="table">
                <tr>
                    <th>주문번호</th>
                    <td><strong>{{ $order->order_number }}</strong></td>
                </tr>
                <tr>
                    <th>고객명</th>
                    <td>{{ $order->contact_name ?: ($order->user?->name ?? '비회원') }}</td>
                </tr>
                <tr>
                    <th>연락처</th>
                    <td>{{ $order->contact_phone ?: ($order->user?->phone ?? '-') }}</td>
                </tr>
                <tr>
                    <th>확정일시</th>
                    <td>{{ now()->format('Y-m-d H:i:s') }}</td>
                </tr>
                <tr>
                    <th>진행상태</th>
                    <td><span class="status-badge">시안 확정 (생산 대기)</span></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            본 메일은 Hebron 쇼핑몰 시스템에서 자동으로 발송되었습니다.
        </div>
    </div>
</body>
</html>
