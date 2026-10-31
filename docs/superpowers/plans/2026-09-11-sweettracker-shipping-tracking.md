# Sweet Tracker Shipping Tracking Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Sweet Tracker delivery lookup into Hebron so customers and admins can see the latest carrier status for a shipment.

**Architecture:** Keep `order_shipments` as the source of truth for shipment identity and business status. Add a server-side Sweet Tracker client, store the provider response and normalized events, and expose a protected refresh/read API. Use scheduled polling and optional Reverb broadcasts for near-real-time UI updates. Never call Sweet Tracker directly from the browser because the API key must remain private.

**Tech Stack:** Laravel 11, PHP 8.2, MySQL, Laravel database queue/scheduler, Laravel HTTP client, Reverb/Echo.

**Spec:** `https://info.sweettracker.co.kr/apidoc/`

## Global Constraints

- Use the official base URL `https://info.sweettracker.co.kr`.
- Use `GET` or `POST` for `/api/v1/trackingInfo` and UTF-8 JSON responses.
- Required provider inputs are API key, courier code, and invoice/tracking number.
- The provider API is pull-based. “Real time” means refresh-on-open plus controlled polling, not a carrier push webhook.
- Shipping price is separate from delivery tracking. Sweet Tracker returns tracking status, not a live freight quote.
- Keep API keys and raw provider payloads out of browser logs and public responses.

## Existing Codebase Findings

- `hebron-api/app/Models/OrderShipment.php` already stores `invoice_number`, `tracking_number`, `carrier_code`, `carrier_name`, status, and shipment timestamps.
- `hebron-api/app/Services/Admin/AdminShipmentService.php` and `AdminShipmentController.php` already expose shipment list/detail APIs.
- Customer order detail is served by `MyPageOrderDeliveryTrackingDetailResource` through `/api/mypage-order-delivery-tracking/histories/{orderNumber}`.
- `delivery_trackings` exists but its legacy admin routes are disabled; the repository comment says shipment is now the single source of truth.
- Laravel database queues and scheduled commands already exist. Reverb is configured and used for dashboard events.
- No Sweet Tracker service, provider configuration, polling command, tracking-history table, or provider-response tests were found.

## Provider Workflow

1. Admin saves a valid carrier code and invoice number on `order_shipments`.
2. The system validates that the shipment uses a supported carrier and has an invoice number.
3. A backend job calls `GET /api/v1/trackingInfo` or `POST /api/v1/trackingInfo` with the API key, carrier code, and invoice number.
4. The adapter parses the provider result and maps carrier-specific statuses into `pending`, `in_transit`, or `delivered`.
5. The system stores the latest raw response, normalized latest event, provider timestamp, and `last_synced_at`.
6. If the normalized status changed, the system updates `order_shipments`, sets `delivered_at` when needed, and emits a shipment-updated event.
7. The customer page reads the cached result immediately. It may request a refresh only when the cache is stale.
8. A scheduler polls active, non-delivered shipments at a safe interval. Backoff and retry rules prevent API overuse.
9. After delivery, polling stops unless an admin explicitly requests a manual refresh.

## Task 1: Define provider configuration and response contract

**Files:**
- Create: `hebron-api/config/services.php` section `sweettracker`
- Modify: `hebron-api/.env.example`
- Create: `hebron-api/app/Integrations/SweetTracker/SweetTrackerClient.php`
- Create: `hebron-api/app/Integrations/SweetTracker/SweetTrackerResponse.php`
- Test: `hebron-api/tests/Unit/Integrations/SweetTrackerClientTest.php`

**Interfaces:**
- `SweetTrackerClient::track(string $carrierCode, string $invoiceNumber): SweetTrackerResponse`
- `SweetTrackerResponse::raw(): array`
- `SweetTrackerResponse::latestEvent(): ?array`
- `SweetTrackerResponse::normalizedStatus(): string`

- [ ] Add `SWEETTRACKER_BASE_URL`, `SWEETTRACKER_API_KEY`, timeout, and retry settings.
- [ ] Send provider requests only from the backend HTTP client.
- [ ] Accept JSON and normalize provider failure responses into typed exceptions.
- [ ] Test success, invalid invoice, expired key, timeout, malformed JSON, and provider HTTP 500.

## Task 2: Add durable sync state and event history

**Files:**
- Create: `hebron-api/database/migrations/2026_09_11_000001_add_sweettracker_fields_to_order_shipments.php`
- Create: `hebron-api/database/migrations/2026_09_11_000002_create_shipment_tracking_events_table.php`
- Modify: `hebron-api/app/Models/OrderShipment.php`
- Create: `hebron-api/app/Models/ShipmentTrackingEvent.php`
- Test: `hebron-api/tests/Feature/ShipmentTrackingPersistenceTest.php`

**Interfaces:**
- `OrderShipment::trackingEvents(): HasMany`
- Fields: `tracking_provider`, `tracking_last_status`, `tracking_last_event_at`, `tracking_last_synced_at`, `tracking_sync_state`, `tracking_sync_error`, `tracking_raw_payload`.
- Event fields: shipment id, provider event key, status, description, location, event time, raw payload, unique fingerprint.

- [ ] Add indexes for active sync queries and event ordering.
- [ ] Preserve the existing shipment status fields and use the new provider fields for detail.
- [ ] Make event insertion idempotent with a stable fingerprint.
- [ ] Test duplicate provider responses do not create duplicate events.

## Task 3: Implement refresh service and queued job

**Files:**
- Create: `hebron-api/app/Services/ShipmentTrackingService.php`
- Create: `hebron-api/app/Jobs/SyncShipmentTrackingJob.php`
- Create: `hebron-api/app/Exceptions/SweetTrackerException.php`
- Test: `hebron-api/tests/Feature/SyncShipmentTrackingJobTest.php`

**Interfaces:**
- `ShipmentTrackingService::sync(OrderShipment $shipment): OrderShipment`
- `ShipmentTrackingService::refreshIfStale(OrderShipment $shipment): OrderShipment`
- `SyncShipmentTrackingJob::handle(ShipmentTrackingService $service): void`

- [ ] Lock one shipment during sync to prevent concurrent provider calls.
- [ ] Mark sync state as `syncing`, `synced`, or `failed`.
- [ ] Map pickup/in-transit/delivered and preserve unknown provider states in raw data.
- [ ] Update order status only when the existing business rules allow it.
- [ ] Retry transient network/5xx errors with bounded backoff; do not retry invalid credentials or invalid invoices.
- [ ] Test status transitions, delivery timestamp, retry behavior, and failed-state persistence.

## Task 4: Add scheduler and operational controls

**Files:**
- Create: `hebron-api/app/Console/Commands/SyncActiveShipmentTracking.php`
- Modify: `hebron-api/routes/console.php`
- Modify: `hebron-api/config/services.php`
- Test: `hebron-api/tests/Feature/SyncActiveShipmentTrackingCommandTest.php`

- [ ] Select only shipments with an invoice number, a supported carrier, and non-delivered status.
- [ ] Skip shipments synced within the configured interval.
- [ ] Dispatch jobs in bounded batches through the existing database queue.
- [ ] Schedule polling every 10 minutes initially; make the interval configurable.
- [ ] Add a manual command option for one shipment and a dry-run option.
- [ ] Log counts and failures without logging API keys or sensitive recipient data.

## Task 5: Expose customer and admin tracking APIs

**Files:**
- Create: `hebron-api/app/Http/Controllers/Api/ShipmentTrackingController.php`
- Create: `hebron-api/app/Http/Requests/ShipmentTrackingRefreshRequest.php`
- Create: `hebron-api/app/Http/Resources/ShipmentTrackingResource.php`
- Modify: `hebron-api/routes/api.php`
- Modify: `hebron-api/app/Http/Resources/MyPageOrderDeliveryTrackingDetailResource.php`
- Modify: `hebron-api/app/Http/Resources/Admin/AdminShipmentResource.php`
- Test: `hebron-api/tests/Feature/ShipmentTrackingApiTest.php`

**Interfaces:**
- `GET /api/mypage-order-delivery-tracking/histories/{orderNumber}/shipment-tracking`
- `POST /api/mypage-order-delivery-tracking/histories/{orderNumber}/shipment-tracking/refresh`
- `GET /api/admin/shipments/{invoiceNumber}/tracking`
- `POST /api/admin/shipments/{invoiceNumber}/tracking/refresh`

- [ ] Authorize customer access by the authenticated order owner.
- [ ] Return `last_synced_at`, `is_stale`, latest status, carrier, invoice number, and ordered event timeline.
- [ ] Return a clear `not_available` state when no invoice number exists.
- [ ] Refresh synchronously only for a user-triggered request; use the queue for bulk/scheduled sync.
- [ ] Rate-limit manual refresh per user and shipment.
- [ ] Test authorization, no-invoice, stale cache, successful refresh, provider failure, and delivered shipment behavior.

## Task 6: Add Reverb updates and frontend display

**Files:**
- Create: `hebron-api/app/Events/ShipmentTrackingUpdated.php`
- Modify: `hebron-api/resources/js/echo.js`
- Locate and modify the existing customer order-detail and admin shipment-detail components that consume the resources above.
- Test: frontend tracking timeline and stale/error states.

- [ ] Broadcast only shipment id, order number, normalized status, latest event, and sync timestamp.
- [ ] Use private channels scoped to the order owner and admin shipment access.
- [ ] Show “last updated” time and a manual refresh action.
- [ ] Poll only while the tracking panel is open and shipment is active; stop on delivered.
- [ ] Show provider-unavailable and no-data states without exposing raw payloads.

## Task 7: Verify, document, and release safely

**Files:**
- Create: `hebron-api/docs/sweettracker-integration.md`
- Modify: `hebron-api/README.md` if integration setup belongs there.
- Test: full backend test suite and frontend build.

- [ ] Run migrations on a staging database.
- [ ] Configure a non-production API key and test one real supported shipment.
- [ ] Verify queue worker and scheduler are running.
- [ ] Verify no secrets appear in logs, API responses, or browser network payloads.
- [ ] Verify delivered shipments stop polling.
- [ ] Verify fallback behavior when Sweet Tracker is unavailable.
- [ ] Add rollback notes for migrations and feature configuration.

## Risks and Decisions

- **High:** Provider limits and current API availability are unknown. Confirm quota and response schema with a real account before implementation.
- **High:** “Real-time” is not push-based in the supplied documentation. Use polling plus cached reads. Do not promise second-by-second location tracking.
- **Medium:** Carrier codes must use Sweet Tracker’s code list, not internal values such as `KR_CJ`. Add an explicit mapping table.
- **Medium:** Existing `delivery_trackings` is legacy and disabled. Do not write new data there unless a separate migration decision reactivates it.
- **Medium:** The provider may return carrier-specific status values. Keep raw responses and map conservatively.
- **Out of scope:** live shipping-price calculation. If “giá shipping real time” means freight quotation, it needs a separate carrier quotation API and address/package inputs.

## Acceptance Criteria

- A shipment with a valid carrier code and invoice number can be refreshed from the backend.
- Customer and admin views show normalized status, latest event, event time, location when provided, and last sync time.
- Scheduled polling updates active shipments without duplicate events or unbounded API calls.
- Delivery completion updates the local shipment once and stops normal polling.
- Provider outages show a safe stale/error state and do not break order detail pages.
- No provider secret or raw recipient information is exposed to the browser.
