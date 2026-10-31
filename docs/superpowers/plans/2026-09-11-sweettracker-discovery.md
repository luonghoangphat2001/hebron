# Discovery Report: Sweet Tracker Shipping Tracking

## Architecture Snapshot

- Backend: Laravel 11, PHP 8.2, MySQL, database queue, scheduler, Reverb.
- Shipment source of truth: `hebron-api/app/Models/OrderShipment.php`.
- Admin entry points: `AdminShipmentController`, `AdminShipmentService`, `/api/admin/shipments`.
- Customer entry point: `OrderHistoryController` and `MyPageOrderDeliveryTrackingDetailResource`.
- Existing shipment fields include carrier code/name, invoice number, tracking number, status, and timestamps.

## Existing Patterns

- External integrations use dedicated classes under `app/Integrations`.
- Background work uses Laravel jobs and database queues.
- Scheduled work is registered in `routes/console.php`.
- Reverb events already exist for private channels.
- A legacy `delivery_trackings` model/table exists, but its admin routes are disabled and comments identify `order_shipments` as the current source of truth.

## Technical Constraints

- Sweet Tracker base URL: `https://info.sweettracker.co.kr`.
- Tracking endpoint: `GET` or `POST /api/v1/trackingInfo`.
- Required inputs: API key, courier code, invoice number.
- Response format: JSON or XML; UTF-8.
- Provider is pull-based. The application must poll for near-real-time updates.
- API key must stay server-side.

## UI Work Detected

- Customer order detail tracking timeline.
- Admin shipment detail and shipment list status.
- Existing UI resources already expose tracking-related fields, but no provider-backed event timeline was found.

## Clarifications

- Working assumption: “real-time tracking” means latest delivery status and event timeline, not GPS location or live freight pricing.
- Working assumption: first release uses Sweet Tracker lookup API with polling. Webhook support is not specified in the supplied documentation.

## External References

- Official API documentation: `https://info.sweettracker.co.kr/apidoc/`.
- Official template endpoint shown in the documentation: `https://info.sweettracker.co.kr/tracking/5`.
- Official carrier code list includes CJ Logistics `04`, Korea Post `01`, Hanjin `05`, and other domestic/international carriers.
