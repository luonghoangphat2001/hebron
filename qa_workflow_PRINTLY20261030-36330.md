# Deployed order workflow QA — PRINTLY20261030-36330

Executed 30 October 2026, approximately 15:29–15:44 Asia/Ho_Chi_Minh.

## Result

Core six-checkpoint workflow passed with manual page reloads. Overall result: PARTIAL PASS, with deployment/UI and notification issues below. This was a live staging test, not a unit-test run. Outgoing calls to the MES test server were real; inbound MES P/C callbacks were simulated by the tester over HTTP.

## Environment and test data

| Item | Value |
| --- | --- |
| Mall | https://hebron-mall.axndx.org |
| CMS | https://hebron-cms.axndx.org |
| API | https://hebron-api.axndx.org |
| SSH | hebron; deployed API commit 099539c |
| Laravel environment | staging |
| MES target | http://test-hebron.happyai.co.kr |
| Customer / administrator | Seeded normaluser / superadmin accounts |
| Order | PRINTLY20261030-36330; database ID 133 |
| Product | HB-9309, product ID 3053, quantity 1, total 300,000 KRW |
| Payment | Bank transfer; manually confirmed in staging CMS. No real bank transfer was made. |
| QA identification | QA WORKFLOW 20261030; company and order note explicitly state TEST ONLY / DO NOT PRODUCE OR SHIP |
| Proof file | Existing public/test-template.png; uploaded twice through CMS |
| Tracking / invoice | QA2026103036330, a test identifier, not a real carrier booking |

## Executed normal workflow

| Checkpoint | Actual action and evidence | Result |
| --- | --- | --- |
| 주문접수 / order received | Logged in as normaluser, opened HB-9309, purchased quantity 1 through checkout, confirmed bank-transfer order. Order created at 15:34:37. State awaiting_payment; CMS manual payment confirmation then set paid/confirmed. | PASS |
| MES registration | Background integration log 139: order_fromMall.php, HTTP 200, response code success from the configured MES test server. | PASS — real outgoing integration |
| 시안확인요청 / request design confirmation | CMS file upload and POST /api/admin/orders/PRINTLY20261030-36330/design-revisions both returned 201. Revision ID 24, pending; order design_confirmation_requested. CMS current checkpoint showed confirmation requested. | PASS |
| 시안 수정요청 / request revision | Customer opened the revision page, entered a QA correction comment and clicked 수정 요청. Revision became modify; order design_rejected; CMS current checkpoint showed 수정요청 and retained the comment. Admin revision-request email had a sent log. | PASS |
| Return to confirmation requested | CMS uploaded a second proof, POST returned 201; new revision slug rev-PRINTLY20261030-36330-20261030083757-HHu9Ua. Order returned to design_confirmation_requested, metadata proof_confirmed_at null. | PASS |
| 시안확정 / design approved | Customer clicked 시안 승인 on revision 2. Page showed 승인됨, order design_confirmed; proof_confirmed_at 2026-10-30T08:38:40+00:00. Mall active checkpoint was 시안확정; it did not prematurely advance to production. | PASS |
| MES design confirmation | Integration log 141: confirm_fromMall.php, HTTP 200, code success from the MES test server. | PASS — real outgoing integration |
| 상품제작중 / in production | Tester sent P callback to deployed /api/mes/status with this order number, estimated date 2026-10-31 and QA tracking number. HTTP 200. Order typesetting; mes_production_started_at 2026-10-30T08:39:49+00:00; shipment pending; no shipped_at or delivered_at. After manual reload, Mall active checkpoint was 상품제작중 and displayed QA tracking. Integration log 142 success. | PASS — simulated inbound callback; auto-refresh failed separately |
| 발송완료 / shipped | Tester sent C callback with dispatch date 2026-10-30. HTTP 200, status_desc Shipped; order shipped; shipment in_transit; shipped_at set; delivered_at null. Mall detail active checkpoint 발송완료, order-list badge 발송완료 and CMS header 발송 완료. Integration log 143 success. | PASS — simulated inbound callback |

## Issues and limitations

| ID | Finding | Evidence / impact | Suggested next check |
| --- | --- | --- | --- |
| QA-WF-01 | Already-open Mall detail did not automatically refresh after P callback. | Backend changed at 15:39:49 UTC+7; more than 60 seconds later the active browser tab still highlighted 시안확정. Network log showed only the initial detail GET. Manual reload at approximately 15:40:55 displayed 상품제작중. | Verify deployed frontend includes polling/refetch changes; check visible-tab refetch behavior. |
| QA-WF-02 | Estimated shipping date not shown on deployed Mall detail. | Database metadata stored estimated_shipping_date=2026-10-31 after P. Browser displayed QA tracking but had no 2026-10-31 text and no estimated-shipping-date row. | Verify deployed API response and frontend date field/rendering. |
| QA-WF-03 | Design-approved admin email failed. | EmailIntegrationLog ID 12: expected SMTP 250, received 451 4.4.2 Timeout — closing connection. Order-received email ID 6 and revision-request email ID 10 were sent. Queued/sent rows are not counted as duplicate deliveries. | Check SMTP connection/retry behavior and resend only this failed QA email if authorized. |
| QA-WF-04 | Server frontend URL configuration points to localhost. | config(app.frontend_url) returned http://localhost:3000. Revision notification source constructs customer links using this setting. The CMS-visible link was separately correct. | Correct staging FRONTEND_URL; inspect a notification payload to confirm its actual outgoing URL. Customer receipt of a broken link was not independently observed. |
| QA-WF-05 | My Page dashboard summary still uses the old five buckets and classifies this shipped order as delivered. | Dashboard at /my-page showed 주문접수=0, 결제완료=0, 상품준비중=0, 배송중=0, 배송완료=1. The recent-order row correctly said 발송완료, while the shipment was in_transit with delivered_at=null. Thus summary and detail disagree, and the summary does not expose six workflow checkpoints. | Deploy/check the dashboard customer_order_status mapping and avoid counting shipped orders as delivered. |

Inbound callbacks were simulated; no MES-admin UI manufacturing or dispatch action was performed. Therefore this does not establish end-to-end MES-originated P/C delivery. Kakao/SMS delivery to a real customer was not verified: the seeded customer uses an invalid test phone number. Email evidence is server-side delivery logging, not an inbox check. Browser console on final customer detail/list checks contained zero errors.

## Evidence

Local screenshots:

- [Received](/Volumes/Outdoor/WALA/hebron/qa-PRINTLY20261030-36330-01-received.png)
- [In production](/Volumes/Outdoor/WALA/hebron/qa-PRINTLY20261030-36330-05-production.png)
- [Shipped](/Volumes/Outdoor/WALA/hebron/qa-PRINTLY20261030-36330-06-shipped.png)
- [Dashboard mismatch](/Volumes/Outdoor/WALA/hebron/qa-PRINTLY20261030-36330-07-dashboard-mismatch.png)

Useful live pages:

- [Mall detail](https://hebron-mall.axndx.org/my-page/orders/PRINTLY20261030-36330)
- [CMS detail](https://hebron-cms.axndx.org/order/PRINTLY20261030-36330)

## Retained test state

One staging order remains paid/shipped with two proof revisions, QA tracking, activity history and integration logs. No actual carrier shipment or physical delivery was initiated. No order/test artifacts were deleted, no user password changed, and no deployment/configuration/source changes were made on the server during this QA run.
