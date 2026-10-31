<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 30px auto; padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; }
        .header { border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: bold; color: #111827; }
        .sub-title { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 15px; font-weight: bold; color: #1f2937; margin-bottom: 12px; border-left: 4px solid #ef4444; padding-left: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .table th, .table td { padding: 10px 12px; text-align: left; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f3f4f6; color: #4b5563; font-weight: 600; width: 30%; }
        .table td { color: #111827; }
        .comment-box { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 16px; color: #991b1b; font-size: 13px; line-height: 1.6; margin-top: 8px; white-space: pre-wrap; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">[Hebron] 고객 시안 수정 요청 알림</div>
            <div class="sub-title">고객이 등록된 시안에 대해 수정을 요청하였습니다. 관리자 페이지에서 확인 후 재작업을 진행해 주세요.</div>
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
                    <th>요청일시</th>
                    <td>{{ now()->format('Y-m-d H:i:s') }}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">고객 수정 요청 사유</div>
            <div class="comment-box">{{ $comment ?: '별도의 코멘트 없이 수정 요청되었습니다.' }}</div>
        </div>

        <div class="footer">
            본 메일은 Hebron 쇼핑몰 시스템에서 자동으로 발송되었습니다.
        </div>
    </div>
</body>
</html>
