# Sweet Tracker Tracking Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist complete Sweet Tracker tracking feedback in Hebron so admin and customer clients can read a durable delivery timeline instead of relying only on the shipment's summary status.

**Architecture:** Keep `order_shipments` as the source of truth for shipment identity and current business status, and add a dedicated `shipment_tracking_events` table for each tracking checkpoint. Both live `trackingInfo` refreshes and inbound webhook feedback pass through one normalization/persistence service that atomically upserts idempotent events and updates the shipment summary. The live admin endpoint returns the provider's sanitized response while persisting it; read APIs return persisted, normalized events without exposing credentials or unrestricted raw provider data.

**Tech Stack:** Laravel 11, PHP 8.2, MySQL/SQLite tests, Laravel HTTP client, Eloquent, Laravel migrations and feature tests.

**Spec:** `https://info.sweettracker.co.kr/apidoc/`; existing plans `docs/superpowers/plans/2026-09-11-sweettracker-shipping-tracking.md` and `docs/superpowers/plans/2026-09-11-sweettracker-webhook-integration.md` (the plans' webhook assumptions must be checked against the actual provider contract before production use).

## Global Constraints

- Sweet Tracker credentials remain server-side and are never returned, stored in event raw data, or logged.
- `order_shipments` remains the authoritative shipment and business-status record; do not write new tracking data to legacy `delivery_trackings`.
- Persist only normalized event fields needed by Hebron; store a redacted provider payload only if operationally necessary and never expose it to clients.
- Event writes must be idempotent, safe under webhook retries, and transactionally consistent with shipment summary updates.
- Preserve current API compatibility; add response fields/endpoints without changing existing order or shipment contracts unexpectedly.
- Provider tracking timestamps use KST unless the actual API response establishes another timezone; document and test the conversion.
- Do not claim webhook delivery is supported until the exact provider contract, authentication, retries, and payload have been verified.

## Target Workflow

```text
Admin opens tracking
  → GET /api/admin/shipments/{invoiceNumber}/tracking
  → backend calls Sweet Tracker trackingInfo with server-side key
  → backend normalizes response and persists event(s) + current shipment summary
  → API returns sanitized live provider data

Sweet Tracker webhook (if confirmed by provider contract)
  → validate/authenticate payload
  → same normalization/persistence service
  → deduplicate event and update order_shipments atomically

Admin/customer tracking read
  → return normalized persisted timeline from Hebron DB

Background polling
  → scheduled dispatcher selects orders with a sent shipment and invoice
  → skips completed, delivery_completed, cancelled, and refund orders
  → queued job refreshes Sweet Tracker and persists new events
```

## Files and Responsibilities

- `hebron-api/database/migrations/*_create_shipment_tracking_events_table.php`: durable event table, foreign key, unique idempotency key, indexes.
- `hebron-api/app/Models/ShipmentTrackingEvent.php`: event casts and shipment relationship.
- `hebron-api/app/Models/OrderShipment.php`: `trackingEvents(): HasMany` relationship.
- `hebron-api/app/Integrations/SweetTracker/SweetTrackerClient.php`: provider request and response handling only.
- `hebron-api/app/Integrations/SweetTracker/SweetTrackerTrackingNormalizer.php`: provider shape to canonical status/event fields.
- `hebron-api/app/Services/ShipmentTrackingPersistenceService.php`: transaction, idempotency, event insertion and current shipment/order state update.
- `hebron-api/app/Jobs/SyncShipmentTrackingJob.php`: refreshes one eligible shipment in the queue and persists its events.
- `hebron-api/app/Console/Commands/SyncActiveShipmentTracking.php`: selects eligible shipments in bounded batches and dispatches jobs.
- `hebron-api/routes/console.php`: schedules the dispatcher and prevents overlapping runs.
- `hebron-api/app/Http/Resources/ShipmentTrackingEventResource.php`: safe normalized event output.
- `hebron-api/app/Http/Controllers/Api/Admin/AdminShipmentController.php`: persist live refresh result and return sanitized provider response; read stored timeline.
- `hebron-api/app/Http/Controllers/Api/SweetTrackerWebhookController.php`: validate webhook and delegate to the common persistence service.
- `hebron-api/routes/api.php`: admin tracking read route and existing webhook route.
- `hebron-api/resources/swagger/openapi.yml`: document live refresh, persisted timeline, and webhook contract only after provider contract is confirmed.
- `hebron-api/tests/Feature/SweetTrackerTrackingPersistenceTest.php`: persistence, duplicate, transition, and ordering coverage.
- `hebron-api/tests/Feature/SweetTrackerTrackingApiTest.php`: API/provider integration coverage.

## Task 0: Verify current branch and provider contract

**Files:**
- Read: current branch versions of `app/Integrations/SweetTracker/SweetTrackerClient.php`, `app/Services/SweetTrackerService.php`, `app/Http/Controllers/Api/Admin/AdminShipmentController.php`, `routes/api.php`, and Sweet Tracker feature tests.
- Read: provider docs/sample for tracking response and webhook, if available.
- Create/update: `docs/superpowers/specs/2026-09-16-sweettracker-tracking-contract.md` only if actual response fields or webhook authentication need to be recorded.

- [ ] Confirm the actual active branch and clean/dirty state; preserve unrelated changes.
- [ ] Confirm `trackingInfo` response fields for invoice, carrier, current status, event list, event timestamp, location, and description using a valid non-production key and real authorized invoice.
- [ ] Confirm whether the provider genuinely sends callbacks/webhooks and document its exact method, payload, auth/signature, retry, and timestamp behavior. If not confirmed, explicitly mark webhook ingestion as deferred; do not invent a provider contract.
- [ ] Decide idempotency identity: use provider event ID when present; otherwise fingerprint shipment ID + provider timestamp + status + location + description.
- [ ] Confirm whether querying tracking should always refresh and persist, or use a short freshness window. Default for this plan: explicit admin tracking GET performs a live refresh; customer/admin history GET reads persisted data only.

## Task 1: Add durable event storage

**Files:**
- Create: `hebron-api/database/migrations/2026_09_16_000001_create_shipment_tracking_events_table.php`
- Create: `hebron-api/app/Models/ShipmentTrackingEvent.php`
- Modify: `hebron-api/app/Models/OrderShipment.php`
- Test: `hebron-api/tests/Feature/SweetTrackerTrackingPersistenceTest.php`

**Schema:**

```text
id
order_shipment_id (FK, cascade delete)
provider_event_key (string; unique together with shipment id)
provider_status (nullable string; original provider state)
normalized_status (pending | in_transit | delivered | unknown)
description (nullable text)
location (nullable string)
event_at (nullable timestamp)
payload_hash (string)
created_at / updated_at
```

- [ ] Write failing migration/model relationship tests, including two events on one shipment and duplicate key rejection/upsert semantics.
- [ ] Run the focused test and verify it fails for the missing table/relationship.
- [ ] Add migration and model casts/relationships; retain only redacted or derived fields, not raw payload by default.
- [ ] Run focused persistence tests and verify ordering by `event_at` then primary key, with null timestamps ordered last.
- [ ] Verify migration up/down on SQLite test DB and inspect indexes/foreign key.

## Task 2: Normalize provider tracking payloads

**Files:**
- Create: `hebron-api/app/Integrations/SweetTracker/SweetTrackerTrackingNormalizer.php`
- Test: `hebron-api/tests/Unit/SweetTrackerTrackingNormalizerTest.php`

- [ ] Add fixtures based only on verified provider response examples; do not guess undocumented fields.
- [ ] Write tests for multiple event rows, missing optional location/time, delivered/in-transit/pickup states, unknown statuses, and KST timestamp conversion.
- [ ] Verify tests fail because the normalizer does not exist.
- [ ] Implement canonical output for each provider event: event key, original provider status, normalized status, description, location, and event time.
- [ ] Keep unknown provider status as `unknown` and preserve its original status string for future remapping.
- [ ] Run normalizer tests and confirm only documented/mapped statuses affect business status.

## Task 3: Persist both live refreshes and callbacks through one service

**Files:**
- Create: `hebron-api/app/Services/ShipmentTrackingPersistenceService.php`
- Modify: `hebron-api/app/Services/SweetTrackerService.php` or replace its persistence delegation without changing unrelated behavior.
- Modify: `hebron-api/app/Http/Controllers/Api/SweetTrackerWebhookController.php` only if webhook contract is verified.
- Test: `hebron-api/tests/Feature/SweetTrackerTrackingPersistenceTest.php`

**Interface:**

```php
ShipmentTrackingPersistenceService::persist(OrderShipment $shipment, array $events): OrderShipment
```

- [ ] Write failing tests proving one provider response inserts all events and updates shipment summary in one transaction.
- [ ] Write failing duplicate-delivery test proving replaying identical tracking data does not create extra events.
- [ ] Write failing out-of-order test proving an older event cannot regress current status or `delivered_at`.
- [ ] Implement a DB transaction and event `upsert`/unique key behavior.
- [ ] Update `order_shipments.status`, `delivered_at`, and `memo` from the newest valid event only; preserve existing status when the provider status is unknown.
- [ ] Update parent order to completed only when delivered, following existing business rules; never move completed order backward.
- [ ] Route verified webhooks through the same service. If webhook contract remains unverified, leave current endpoint behavior isolated and document that it is not production-ready rather than storing guessed payloads.
- [ ] Run focused tests for normal insert, retry duplicate, out-of-order events, delivered transition, and transaction rollback.

## Task 4: Persist provider result from the live admin refresh API

**Files:**
- Modify: `hebron-api/app/Integrations/SweetTracker/SweetTrackerClient.php`
- Modify: `hebron-api/app/Http/Controllers/Api/Admin/AdminShipmentController.php`
- Modify: `hebron-api/routes/api.php`
- Test: `hebron-api/tests/Feature/SweetTrackerTrackingApiTest.php`

- [ ] Test that admin GET `/api/admin/shipments/{invoiceNumber}/tracking` sends exactly `t_key`, `t_code`, and `t_invoice` server-side.
- [ ] Test that provider event data is persisted and the live response excludes every credential field, including nested credential-shaped keys.
- [ ] Test missing shipment, missing carrier code, invalid/expired key, provider timeout, provider HTTP 4xx/5xx, and malformed JSON without persisting partial events.
- [ ] Delegate normalized provider events to the shared persistence service before returning the sanitized live provider payload.
- [ ] Return stable error messages that do not echo credentials or arbitrary provider response bodies.
- [ ] Run the tracking API test and existing shipment workflow tests.

## Task 5: Add persisted timeline read API for FE

**Files:**
- Create: `hebron-api/app/Http/Resources/ShipmentTrackingEventResource.php`
- Modify: `hebron-api/app/Http/Controllers/Api/Admin/AdminShipmentController.php`
- Modify: `hebron-api/routes/api.php`
- Test: `hebron-api/tests/Feature/SweetTrackerTrackingApiTest.php`

**Interface:**

```http
GET /api/admin/shipments/{invoiceNumber}/tracking/events
```

- [ ] Test event ordering, normalized fields, empty history, unknown invoice, and bearer/admin authorization.
- [ ] Add a read-only timeline route that does not call Sweet Tracker.
- [ ] Return invoice, carrier, current shipment status, last event time, and safe normalized events; never return credentials or raw payloads.
- [ ] Document that `/tracking` performs a live provider refresh and `/tracking/events` reads persisted history.
- [ ] Run focused API tests and verify existing `/invoice/{invoiceNumber}` contract remains unchanged.

## Task 6: Poll shipped orders in the background

**Files:**
- Create: `hebron-api/app/Jobs/SyncShipmentTrackingJob.php`
- Create: `hebron-api/app/Console/Commands/SyncActiveShipmentTracking.php`
- Modify: `hebron-api/routes/console.php`
- Test: `hebron-api/tests/Feature/SyncActiveShipmentTrackingTest.php`

- [ ] Test an eligible shipment: it has an invoice and carrier, is not delivered, and its order is in the shipping workflow.
- [ ] Test that orders with statuses `completed`, `delivery_completed`, `cancelled`, `refund_requested`, and `refund_completed` are excluded.
- [ ] Test the queued job calls Sweet Tracker and persists returned events through `ShipmentTrackingPersistenceService`.
- [ ] Implement bounded selection and queue dispatch; the scheduled command must not call the provider directly.
- [ ] Schedule the dispatcher every 10 minutes with `withoutOverlapping()`; skip delivered shipments and excluded order statuses.
- [ ] Add a per-shipment freshness check so scheduler reruns respect the configured provider-call interval.
- [ ] Log counts and sanitized failures only; never log credentials, recipient details, or raw provider payloads.
- [ ] Verify job retries are bounded and duplicate responses remain idempotent.

## Task 7: Update Swagger, operations notes, and release checks

**Files:**
- Modify: `hebron-api/resources/swagger/openapi.yml`
- Modify/Create: `hebron-api/docs/sweettracker-webhook-operations.md`
- Modify: `hebron-api/.env.example` only when a new provider config setting is required.

- [ ] Document live refresh and persisted timeline separately, including auth, request/response examples, freshness behavior, and 404/422/provider error cases.
- [ ] Document event dedupe behavior, timestamp timezone, rollback migration, replay procedure, and provider key rotation.
- [ ] Validate OpenAPI YAML and API route list.
- [ ] Run all Sweet Tracker tests and shipment workflow tests; report unrelated full-suite failures separately.
- [ ] Verify no key/raw payload appears in test output, application responses, or logs.
- [ ] Do not enable production webhook ingestion until Task 0 contract/security checks are complete.

## Acceptance Criteria

- A live `trackingInfo` refresh persists all verified provider checkpoints as normalized, deduplicated events.
- A background job refreshes eligible orders that have a sent shipment, carrier, and invoice; completed, delivery-completed, cancelled, and refund orders are excluded.
- Retrying an identical response/webhook does not create duplicate events.
- An out-of-order event cannot regress the current shipment/order status.
- `order_shipments` summary and event history remain consistent after each successful refresh.
- FE can fetch persisted event history without another Sweet Tracker request.
- Provider credentials and unrestricted raw provider payloads never leave the backend.
- Existing shipment APIs remain backward-compatible.
- Webhook ingestion is production-enabled only when its provider contract is verified; otherwise the implementation marks it deferred.

## Review Decisions Requested

1. Approve the shared-source design: live `trackingInfo` and verified webhook feedback both persist via one service; FE history reads Hebron DB.
2. Confirm whether every admin open should call Sweet Tracker live, or whether a freshness window is preferred. This plan currently assumes explicit admin refresh calls live; timeline reads remain DB-only.
3. Confirm webhook contract availability. If none is available, approve deferring production webhook persistence until Sweet Tracker supplies it.
