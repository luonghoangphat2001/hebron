# Sweet Tracker Webhook Shipping Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Sweet Tracker flow shown in the supplied image: sync delivery companies, register real invoices, receive tracking webhooks, and save delivery updates in Hebron.

**Architecture:** `order_shipments` remains the source of truth. Hebron first fetches and stores Sweet Tracker delivery-company codes. When a real invoice and carrier are entered, the backend registers that shipment with Sweet Tracker. Sweet Tracker then calls a public backend webhook whenever tracking changes. Hebron validates, maps, persists, and broadcasts the update to customer and admin screens.

**Tech Stack:** Laravel 11, PHP 8.2, MySQL, Laravel HTTP client, database queue, Reverb/Echo.

**Spec:** Supplied workflow image plus Sweet Tracker API documentation at `https://info.sweettracker.co.kr/apidoc/`. The provider PDF and current HTML sample named in the image are not present in this workspace and must be added or obtained before final contract implementation.

## Global Constraints

- The provider PDF/HTML contract is authoritative for registration and webhook field names.
- Use the official delivery-company API to fetch company codes and names.
- Use real invoice numbers for provider registration tests. Do not use seeded fake values in provider calls.
- Keep Sweet Tracker credentials server-side.
- The webhook must be public enough for Sweet Tracker to reach it, but protected by provider authentication, signature, allowlist, or a shared secret defined by the provider contract.
- A webhook retry must be safe and idempotent.
- Do not use `delivery_trackings` as the new source of truth; its legacy routes are disabled. Write to `order_shipments` and a dedicated event table.
- This plan covers delivery tracking. It does not calculate shipping price.

## Required Workflow

```text
1. Fetch delivery companies from Sweet Tracker
   → store company code/name locally
   → refresh once initially, then weekly

2. Admin enters real invoice number + delivery company
   → validate and save to order_shipments
   → register shipment with Sweet Tracker

3. Sweet Tracker tracks the shipment
   → delivery status changes
   → Sweet Tracker calls Hebron webhook

4. Hebron receives webhook
   → authenticate and validate payload
   → find shipment by provider registration/invoice
   → normalize status and event
   → update order_shipments and tracking events
   → broadcast customer/admin update
```

## Task 0: Obtain and lock the provider contract

**Files:**
- Add/read: `document/sweettracker/<provider-pdf>.pdf`
- Add/read: `document/sweettracker/<provider-html>.html`
- Create: `docs/superpowers/specs/2026-09-11-sweettracker-webhook-contract.md`

- [ ] Obtain the Sweet Tracker PDF and HTML referenced in the image.
- [ ] Record exact company-list endpoint, registration endpoint, auth headers, request fields, webhook URL format, webhook method, payload fields, status values, retry behavior, and signature rules.
- [ ] Confirm whether registration is one API call per invoice or a batch call.
- [ ] Confirm whether webhook data contains carrier code, invoice number, status, event time, location, and unique event id.
- [ ] Confirm test API base URL and production base URL.
- [ ] Mark any field not defined by the provider as an explicit implementation decision.

## Task 1: Store delivery-company master data

**Files:**
- Create: `hebron-api/database/migrations/2026_09_11_000003_create_shipping_carriers_table.php`
- Create: `hebron-api/app/Models/ShippingCarrier.php`
- Create: `hebron-api/app/Integrations/SweetTracker/SweetTrackerCompanyClient.php`
- Create: `hebron-api/app/Console/Commands/SyncSweetTrackerCompanies.php`
- Modify: `hebron-api/routes/console.php`
- Test: `hebron-api/tests/Feature/SweetTrackerCompanySyncTest.php`

**Interfaces:**
- `SweetTrackerCompanyClient::list(): array<int, array{code:string,name:string,active:bool}>`
- `SyncSweetTrackerCompanies::handle(): int`

- [ ] Add unique provider company code, name, active flag, raw payload, and `synced_at`.
- [ ] Fetch the provider list through the backend client.
- [ ] Upsert by provider code without deleting companies that appear temporarily absent.
- [ ] Add a weekly scheduled sync and a manual command.
- [ ] Test create, update, duplicate, inactive, provider error, and idempotent rerun behavior.

## Task 2: Map local carrier data to provider carrier data

**Files:**
- Create: `hebron-api/database/migrations/2026_09_11_000004_add_sweettracker_company_code_to_order_shipments.php`
- Modify: `hebron-api/app/Models/OrderShipment.php`
- Create: `hebron-api/app/Services/SweetTrackerCarrierMappingService.php`
- Test: `hebron-api/tests/Unit/SweetTrackerCarrierMappingServiceTest.php`

- [ ] Keep Hebron `carrier_code` and provider company code separate.
- [ ] Allow an explicit provider code on each shipment.
- [ ] Resolve carrier by provider code first, then by an approved local mapping.
- [ ] Reject registration when the provider company code is missing or inactive.
- [ ] Test CJ, Hanjin, Korea Post, unknown carrier, and inactive carrier cases.

## Task 3: Register invoice tracking with Sweet Tracker

**Files:**
- Create: `hebron-api/app/Integrations/SweetTracker/SweetTrackerTrackingClient.php`
- Create: `hebron-api/app/Services/SweetTrackerRegistrationService.php`
- Create: `hebron-api/app/Jobs/RegisterSweetTrackerShipmentJob.php`
- Modify: `hebron-api/app/Http/Controllers/Api/Admin/AdminOrderController.php`
- Modify: `hebron-api/app/Http/Requests/Admin/Shipment/AdminUpdateWaybillRequest.php`
- Modify: `hebron-api/app/Models/OrderShipment.php`
- Test: `hebron-api/tests/Feature/SweetTrackerRegistrationTest.php`

**Interfaces:**
- `SweetTrackerTrackingClient::register(string $companyCode, string $invoiceNumber): RegistrationResult`
- `SweetTrackerRegistrationService::register(OrderShipment $shipment): void`
- `RegisterSweetTrackerShipmentJob::handle(SweetTrackerRegistrationService $service): void`

- [ ] Save the real invoice and provider company code before registration.
- [ ] Register only after both values pass validation.
- [ ] Store provider registration id/status and registration timestamp.
- [ ] Make registration idempotent so an invoice is not registered twice.
- [ ] Queue registration after the shipment transaction commits.
- [ ] Show registration failure to admin and keep the local invoice usable for retry.
- [ ] Test successful registration, duplicate registration, invalid invoice, invalid company, timeout, and provider 4xx/5xx.

## Task 4: Receive and process Sweet Tracker webhook

**Files:**
- Create: `hebron-api/routes/sweettracker.php`
- Create: `hebron-api/app/Http/Controllers/Webhooks/SweetTrackerWebhookController.php`
- Create: `hebron-api/app/Http/Requests/Webhooks/SweetTrackerWebhookRequest.php`
- Create: `hebron-api/app/Services/SweetTrackerWebhookService.php`
- Create: `hebron-api/app/Jobs/ProcessSweetTrackerWebhookJob.php`
- Create: `hebron-api/database/migrations/2026_09_11_000005_create_shipment_tracking_events_table.php`
- Create: `hebron-api/app/Models/ShipmentTrackingEvent.php`
- Test: `hebron-api/tests/Feature/SweetTrackerWebhookTest.php`

**Interfaces:**
- `SweetTrackerWebhookController::store(SweetTrackerWebhookRequest $request): JsonResponse`
- `SweetTrackerWebhookService::process(array $payload): ShipmentTrackingEvent`
- `ProcessSweetTrackerWebhookJob::handle(SweetTrackerWebhookService $service): void`

- [ ] Register one public POST endpoint, for example `/api/webhooks/sweettracker/tracking`.
- [ ] Authenticate the request using the exact provider mechanism from Task 0.
- [ ] Acknowledge valid requests quickly, then process through the queue if provider retry rules allow it.
- [ ] Find shipments by provider registration id and invoice/company fallback.
- [ ] Store the raw provider payload privately and a normalized event publicly.
- [ ] Map provider states to `pending`, `in_transit`, and `delivered`; preserve unknown states.
- [ ] Update `order_shipments.status`, `delivered_at`, and last tracking fields in one transaction.
- [ ] Use a unique event key/fingerprint to make retries idempotent.
- [ ] Return provider-compatible 2xx/4xx responses so retries behave correctly.
- [ ] Test authentication failure, malformed payload, unknown shipment, duplicate event, out-of-order event, and delivery completion.

## Task 5: Expose tracking data to customer and admin

**Files:**
- Create: `hebron-api/app/Http/Resources/ShipmentTrackingResource.php`
- Create: `hebron-api/app/Http/Controllers/Api/ShipmentTrackingController.php`
- Modify: `hebron-api/routes/api.php`
- Modify: `hebron-api/app/Http/Resources/MyPageOrderDeliveryTrackingDetailResource.php`
- Modify: `hebron-api/app/Http/Resources/Admin/AdminShipmentResource.php`
- Test: `hebron-api/tests/Feature/ShipmentTrackingReadApiTest.php`

**Interfaces:**
- `GET /api/mypage-order-delivery-tracking/histories/{orderNumber}/shipment-tracking`
- `GET /api/admin/shipments/{invoiceNumber}/tracking`

- [ ] Authorize customer access by order owner.
- [ ] Return carrier, invoice, normalized status, latest event, event timeline, and update time.
- [ ] Return a clear `not_registered` or `no_tracking_data` state.
- [ ] Never return API keys, webhook secrets, or unrestricted raw payloads.
- [ ] Keep existing order detail response backward compatible.

## Task 6: Broadcast tracking changes to the UI

**Files:**
- Create: `hebron-api/app/Events/ShipmentTrackingUpdated.php`
- Modify: `hebron-api/resources/js/echo.js`
- Modify: existing customer order-detail and admin shipment-detail components.
- Test: frontend event update and fallback refresh behavior.

- [ ] Broadcast only the normalized shipment event and sync timestamp.
- [ ] Use private channels scoped to the order owner and admin access.
- [ ] Refresh the timeline after a webhook event.
- [ ] Show stale, not registered, provider error, and delivered states.
- [ ] Keep manual refresh as a fallback; do not poll continuously when webhook delivery is healthy.

## Task 7: Test environment and production release

**Files:**
- Modify: `hebron-api/.env.example`
- Create: `hebron-api/docs/sweettracker-webhook-operations.md`
- Modify: `hebron-api/README.md` if setup belongs there.

- [ ] Configure test base URL, production base URL, API key, webhook secret, and provider registration settings.
- [ ] Use the provider test API during development.
- [ ] Test with real invoice numbers supplied by Lia or Jaydon, as stated in the image.
- [ ] Register the exact production webhook URL with Sweet Tracker.
- [ ] Confirm production server/domain IP allowlisting before enabling production calls.
- [ ] Confirm queue worker, webhook route, HTTPS, and logging in staging.
- [ ] Sign a Sweet Tracker production contract before production activation.
- [ ] Keep production API disabled until provider allowlisting is complete.
- [ ] Add runbook steps for retrying failed registration and replaying a webhook safely.

## Acceptance Criteria

- Delivery-company data can be fetched and stored locally, then refreshed weekly.
- Admin can save a real carrier and invoice against an order shipment.
- The shipment is registered once with Sweet Tracker and registration status is visible.
- A valid Sweet Tracker webhook updates the correct shipment and order status.
- Duplicate and out-of-order webhooks do not corrupt state or duplicate events.
- Customer and admin screens show the latest delivery timeline.
- Production calls remain blocked until contract, test, HTTPS, and IP allowlisting checks pass.

## Important Gap From the Supplied Materials

The image refers to a Sweet Tracker PDF and an HTML implementation file, but only the image is currently available in the workspace. The public API documentation confirms delivery-company lookup and tracking APIs, but the exact registration/webhook contract must come from the provider PDF or test API. Task 0 must complete before implementation code is written.
