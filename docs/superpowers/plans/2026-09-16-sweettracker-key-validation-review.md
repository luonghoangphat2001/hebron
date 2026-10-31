# Sweet Tracker Key Validation Review

## Status

Blocked pending provider credential/contract review. No production code was changed after the live smoke test.

## Evidence

- `SWEETTRACKER_API_KEY` is present in `hebron-api/.env` (value not recorded here).
- Sweet Tracker company-list request was sent server-side to the configured info endpoint using `t_key`.
- Provider response: HTTP 400.
- Provider message: the key cannot be found, has expired, or is invalid.
- Existing Sweet Tracker unit and webhook tests pass: 4 tests, 10 assertions.
- Full suite currently has 15 unrelated failures, including missing Aligo configuration and existing content/route fixture failures.

## Review Questions

1. Confirm that the supplied credential is an active Smart택배 API key for the `info.sweettracker.co.kr` REST API, not a trace/registration key or a dashboard key.
2. Confirm the exact request parameter spelling and endpoint from the provider account/documentation. The public documentation shows the REST base URL and company-list endpoint, while the registration/webhook contract is not present in this workspace.
3. Confirm whether the key is restricted by source IP, plan, environment, or allowed API endpoints.

## Proposed Next Steps After Approval

1. Re-run the company-list smoke test after the provider confirms or replaces the credential.
2. Add a provider-facing integration test/diagnostic command that reports HTTP status and a sanitized provider error, never the key or raw recipient data.
3. Continue carrier master-data sync only after the company-list request returns valid JSON.
4. Keep invoice registration/webhook implementation paused until the provider supplies the exact registration and callback contract.

## Scope Boundary

Do not change `SweetTrackerClient`, `.env`, or existing user modifications until this plan is reviewed and the provider credential/contract is confirmed.
