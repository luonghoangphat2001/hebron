# Manual Delivery Creation and MES Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a delivery manually by `order_number`, mark both order and delivery as `ready_to_ship`, and synchronize the delivery data to MES.

**Architecture:** Keep manual delivery creation in the admin delivery flow. Reuse `Order`, `OrderShipment`, and `DeliveryTracking` as the internal source of truth. Add a separate outbound MES integration call after the local transaction succeeds. Keep the existing inbound `POST /api/mes/status` contract unchanged.

**Tech Stack:** Laravel, PHP, Eloquent, database transactions, Laravel HTTP client, PHPUnit/Pest feature tests.

**Spec:** User-provided MES “Work Order Status Change API” document and the approved flow in this conversation.

## Global Constraints

- Delivery creation is manual; `POST /api/mes/status` must not create deliveries automatically.
- `delivery_status` must support the value `ready_to_ship`.
- The order status must become `ready_to_ship` when delivery creation succeeds.
- Internal delivery data must be committed before the outbound MES request starts.
- The outbound MES URL, payload, and response rules must come from the MES contract; do not invent them from the inbound document.
- A failed MES request must not delete the locally created delivery.
- Existing inbound MES behavior for `status = P` and `status = C` remains backward compatible.

---

## Current Code Map

- `app/Models/Order.php` has `orderShipment()` and `deliveryTracking()` relations.
- `app/Models/OrderShipment.php` stores `tracking_number`, `carrier_name`, shipping address fields, `shipped_at`, and `delivered_at`.
- `app/Models/DeliveryTracking.php` stores `invoice_number`, `waybill_registered_at`, `delivery_status`, `courier_name`, and `tracking_info`.
- `app/Enums/DeliveryStatus.php` currently contains `pickup`, `in_transit`, and `delivered`.
- `app/Http/Controllers/Api/Admin/AdminDeliveryTrackingController.php` currently exposes list, detail, and export actions, but no create action.
- `app/Services/Admin/AdminDeliveryTrackingService.php` currently provides query and detail behavior, but no create behavior.
- `routes/api.php` contains the admin delivery tracking route group under `deliveries/tracking`.
- `app/Http/Controllers/Api/MesWebhookController.php` owns inbound `POST /api/mes/status`.
- `app/Integrations/Mes/MESOrderIntegration.php` and `app/Integrations/Mes/MesClient.php` provide the outbound MES integration pattern and integration logging.

## Task 1: Confirm the outbound MES contract

**Files:**
- Read: `app/Integrations/Mes/MesClient.php`
- Read: `app/Integrations/Mes/MESOrderIntegration.php`
- Read: the supplied MES API document
- Document: `docs/superpowers/plans/2026-09-08-manual-delivery-mes-sync.md`

**Interfaces:**
- Consumes: The MES document supplied by the user and the existing outbound integration conventions.
- Produces: An agreed endpoint, HTTP method, request fields, status mapping, success response, failure response, and retry rule for Website → MES delivery sync.

- [ ] **Step 1: Compare the supplied document with the requested direction**

  Record that the supplied `/mes/status` document describes MES → Website. It does not define the Website → MES endpoint needed after manual delivery creation.

- [ ] **Step 2: Confirm the outbound contract before coding**

  Confirm these exact values with the MES owner:

  ```text
  endpoint: exact outbound path
  method: POST or other method
  order field: order_id or order_number
  date field: delivery_date and its meaning
  courier field: courier
  tracking field: tracking_no
  status values: the value sent for ready_to_ship
  success response: HTTP status and body rule
  retry rule: retryable statuses and maximum attempts
  ```

- [ ] **Step 3: Record the confirmed contract as the implementation gate**

  Do not start the outbound sync task until the exact MES endpoint, payload, status, and response rules are attached to the task. If MES has no outbound API, implement only a persisted `pending` sync record and an explicit failed response; do not send an invented request.

## Task 2: Add the `ready_to_ship` delivery status

**Files:**
- Modify: `hebron-api/app/Enums/DeliveryStatus.php`
- Test: `hebron-api/tests/Unit/DeliveryStatusTest.php`

**Interfaces:**
- Consumes: Existing `DeliveryStatus::options()` behavior.
- Produces: `DeliveryStatus::ReadyToShip` with value `ready_to_ship` and label `Ready to Ship`.

- [ ] **Step 1: Add a failing enum test**

  Assert that `DeliveryStatus::ReadyToShip->value` equals `ready_to_ship`, its label equals `Ready to Ship`, and `options()` includes the new value.

- [ ] **Step 2: Run the focused test and verify it fails**

  Run: `php artisan test tests/Unit/DeliveryStatusTest.php`

  Expected: FAIL because the enum case does not exist.

- [ ] **Step 3: Add the enum case and label**

  Add the case beside the other delivery lifecycle values. Keep the existing database column unchanged because it is a string column and does not use a database enum constraint.

- [ ] **Step 4: Run the focused test and verify it passes**

  Run: `php artisan test tests/Unit/DeliveryStatusTest.php`

  Expected: PASS.

## Task 3: Add the manual delivery creation request and route

**Files:**
- Create: `hebron-api/app/Http/Requests/Admin/DeliveryTracking/AdminCreateDeliveryRequest.php`
- Modify: `hebron-api/routes/api.php`
- Modify: `hebron-api/app/Http/Controllers/Api/Admin/AdminDeliveryTrackingController.php`

**Interfaces:**
- Consumes: `order_number` from an authenticated admin request.
- Produces: `POST /api/admin/deliveries/tracking` calling `AdminDeliveryTrackingController::store()`.

- [ ] **Step 1: Add a failing feature test for the route contract**

  Send an authenticated POST request with `{ "order_number": "ORD-123456" }`. Assert that the route is registered and that validation rejects a missing `order_number` with HTTP 422.

- [ ] **Step 2: Run the focused test and verify it fails**

  Run: `php artisan test tests/Feature/AdminDeliveryTrackingTest.php --filter=requires_order_number`

  Expected: FAIL because the route and request class do not exist.

- [ ] **Step 3: Implement request validation**

  Validate `order_number` as required, string, and bounded by the project’s normal order-number length. Do not accept tracking or courier fields from this manual endpoint; those values must come from the order shipment record.

- [ ] **Step 4: Register the admin route**

  Add `POST /deliveries/tracking` inside the existing admin delivery route group and use the same admin middleware as neighboring shipment and delivery routes.

- [ ] **Step 5: Add the controller method**

  Validate the request, call `AdminDeliveryTrackingService::createByOrderNumber($orderNumber)`, and return the created order and delivery resource using the project’s existing success/error response style.

- [ ] **Step 6: Run the focused validation test**

  Run: `php artisan test tests/Feature/AdminDeliveryTrackingTest.php --filter=requires_order_number`

  Expected: PASS.

## Task 4: Implement local delivery creation and order status update

**Files:**
- Modify: `hebron-api/app/Services/Admin/AdminDeliveryTrackingService.php`
- Modify: `hebron-api/app/Models/DeliveryTracking.php` only if the selected resource needs a relation or fillable field
- Modify: `hebron-api/app/Http/Resources/Admin/AdminDeliveryTrackingDetailResource.php` if the response needs the new status
- Test: `hebron-api/tests/Feature/AdminDeliveryTrackingTest.php`

**Interfaces:**
- Consumes: `createByOrderNumber(string $orderNumber): array`.
- Produces: A transaction result containing the `Order`, `OrderShipment`, and `DeliveryTracking` records needed by the controller and sync job/service.

- [ ] **Step 1: Add failing tests for the local transaction**

  Cover these cases:

  ```text
  existing order + existing orderShipment -> creates delivery and updates order
  missing order -> 404
  missing orderShipment -> 422
  missing tracking_number -> 422
  existing delivery for the order -> updates it instead of creating a duplicate
  cancelled or completed order -> 422
  ```

- [ ] **Step 2: Run the focused tests and verify the new behavior fails**

  Run: `php artisan test tests/Feature/AdminDeliveryTrackingTest.php`

  Expected: New behavior tests FAIL before the service implementation exists.

- [ ] **Step 3: Load the order by `order_number` with `orderShipment`**

  Use the existing `Order::orderShipment()` relation. Treat the external MES `order_id` as a separate concern; the manual endpoint accepts the store `order_number`.

- [ ] **Step 4: Validate source shipping data**

  Require `orderShipment.tracking_number`. Use `carrier_name` for `courier_name`. Use the project-approved date field for `waybill_registered_at`; do not write an estimated date into `delivered_at`.

- [ ] **Step 5: Upsert the delivery inside a transaction**

  Use the order relation to find the existing delivery. Write:

  ```php
  invoice_number = $orderShipment->tracking_number;
  delivery_status = DeliveryStatus::ReadyToShip;
  courier_name = $orderShipment->carrier_name;
  waybill_registered_at = approved shipment date;
  tracking_info = approved shipping snapshot;
  ```

  Update the order status to `OrderStatus::ReadyToShip` in the same transaction.

- [ ] **Step 6: Return a stable result for the outbound sync**

  Return the order number, internal order ID, tracking number, courier, delivery date, delivery ID, and `ready_to_ship` status. Keep this internal result separate from the external MES response format.

- [ ] **Step 7: Run the focused tests and verify they pass**

  Run: `php artisan test tests/Feature/AdminDeliveryTrackingTest.php`

  Expected: PASS for local creation, validation, status update, and duplicate protection.

## Task 5: Add Website → MES delivery synchronization

**Files:**
- Modify: `hebron-api/app/Integrations/Mes/MESOrderIntegration.php`
- Create: `hebron-api/app/Jobs/SyncDeliveryToMesJob.php`
- Modify: `hebron-api/app/Services/Admin/AdminDeliveryTrackingService.php`
- Test: `hebron-api/tests/Feature/AdminDeliveryTrackingMesSyncTest.php`

**Interfaces:**
- Consumes: The confirmed outbound MES contract from Task 1 and the local transaction result from Task 4.
- Produces: A logged MES request with retryable failure handling and no local data loss.

- [ ] **Step 1: Add failing tests for the outbound payload**

  Fake the MES HTTP client. Assert that manual creation sends the confirmed MES fields, including the exact order identifier, `tracking_no`, `delivery_date`, courier, and the confirmed `ready_to_ship` status.

- [ ] **Step 2: Add failing tests for success and failure**

  Assert that:

  ```text
  successful MES response -> local delivery remains ready_to_ship and sync is recorded as success
  failed MES response -> local delivery remains ready_to_ship and sync is recorded as failed
  timeout -> local delivery remains ready_to_ship and retry state is recorded
  ```

- [ ] **Step 3: Implement the outbound integration method**

  Add a focused method to `MESOrderIntegration` using the existing `MesClient::post()` logging pattern. Use only the confirmed endpoint and field names from Task 1.

- [ ] **Step 4: Dispatch the sync after the local transaction commits**

  Dispatch `SyncDeliveryToMesJob` after commit. Return local delivery success with `mes_sync_status = pending`. The job calls the confirmed outbound endpoint, records success or failure through the existing MES log pattern, and retries only according to the confirmed retry rule.

- [ ] **Step 5: Keep the inbound webhook independent**

  Do not call `DeliveryTracking::create()` from `MesWebhookController::updateStatus()`. Keep `POST /api/mes/status` responsible for the existing inbound update and log behavior.

- [ ] **Step 6: Run the MES sync tests**

  Run: `php artisan test tests/Feature/AdminDeliveryTrackingMesSyncTest.php`

  Expected: PASS with no real MES network request.

## Task 6: Correct and document date/status mapping

**Files:**
- Modify: `hebron-api/app/Http/Controllers/Api/MesWebhookController.php`
- Modify: `hebron-api/resources/swagger/openapi.yml`
- Modify: `hebron-api/README.md` or the project’s API documentation location
- Test: `hebron-api/tests/Feature/MesWebhookTest.php`

**Interfaces:**
- Consumes: The supplied inbound MES document and the confirmed outbound contract.
- Produces: Documented and tested mappings for `delivery_date`, `tracking_no`, courier, and `P/C` statuses.

- [ ] **Step 1: Add tests for the existing inbound contract**

  Assert that `/api/mes/status` still validates all required fields and accepts only `P` and `C` for `status`.

- [ ] **Step 2: Fix date mapping after business confirmation**

  The current code writes `delivery_date` to `order_shipments.delivered_at`, while the supplied document describes it as an estimated shipping date. Map it to `shipped_at` or a dedicated estimated-delivery field according to the confirmed business meaning. Do not silently keep the current mapping.

- [ ] **Step 3: Document both directions**

  Document that manual delivery creation is the only flow that creates `DeliveryTracking`. Document that the MES webhook updates existing shipment/order data and does not create delivery records.

- [ ] **Step 4: Run the inbound MES tests**

  Run: `php artisan test tests/Feature/MesWebhookTest.php`

  Expected: PASS with the existing `P/C` contract preserved.

## Task 7: Full verification

**Files:**
- Read: all files changed by Tasks 1–6
- Test: `hebron-api/tests/Unit/DeliveryStatusTest.php`
- Test: `hebron-api/tests/Feature/AdminDeliveryTrackingTest.php`
- Test: `hebron-api/tests/Feature/AdminDeliveryTrackingMesSyncTest.php`
- Test: `hebron-api/tests/Feature/MesWebhookTest.php`

- [ ] **Step 1: Run focused tests**

  Run:

  ```bash
  php artisan test tests/Unit/DeliveryStatusTest.php
  php artisan test tests/Feature/AdminDeliveryTrackingTest.php
  php artisan test tests/Feature/AdminDeliveryTrackingMesSyncTest.php
  php artisan test tests/Feature/MesWebhookTest.php
  ```

- [ ] **Step 2: Run the full test suite**

  Run: `php artisan test`

  Expected: All tests pass.

- [ ] **Step 3: Check the final diff**

  Run: `git diff --check`

  Expected: No whitespace errors.

- [ ] **Step 4: Verify the route and contract**

  Confirm that the manual admin endpoint is protected by admin middleware, the inbound `/api/mes/status` endpoint remains available, and the outbound MES endpoint uses only the confirmed contract.
