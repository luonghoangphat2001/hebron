# Hebron API

Backend API for the Hebron project, built with Laravel 13 + PHP 8.4.

## Requirements

- Docker & Docker Compose

## Installation

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

Access: http://localhost:8000

## Services

| Service | Container | Port |
|---------|-----------|------|
| PHP-FPM | hebron_app | 9000 (internal) |
| Nginx | hebron_nginx | 8000 |
| MySQL 8.0 | hebron_mysql | 3306 |

## Common Commands

```bash
# Run migrations
docker compose exec app php artisan migrate

# Enter container shell
docker compose exec app bash

# View logs
docker compose logs -f app
```


## Admin production print downloads (breaking response change)

`GET /api/admin/orders/{orderNumber}/print-pdf` now returns **JSON**, replacing the
previous merged PDF attachment. Existing frontend calls using `responseType: 'blob'`
for this endpoint must be updated before this workflow can download separate files.
Backend changes alone do not trigger browser downloads; frontend implementation is
outside this change.

Both endpoints require the existing authenticated admin session or bearer token and
admin permissions. The manifest is ordered by ascending order item ID:

```json
{
  "success": true,
  "data": {
    "order_number": "PRINT-001",
    "files": [
      {
        "order_item_id": 17,
        "design_group_id": 42,
        "filename": "order-PRINT-001-item-17-design-42-print.pdf",
        "download_url": "https://api.example.com/api/admin/orders/PRINT-001/items/17/print-pdf"
      }
    ]
  }
}
```

Each entry represents one order item with a design, including all its front/back
pages in one PDF. Quantity does not duplicate files. Repeated design groups on
separate items produce separate entries and distinct filenames. Items without a
design are omitted. No ZIP or production PDF merge is performed.

`GET /api/admin/orders/{orderNumber}/items/{orderItemId}/print-pdf` returns the
original stored print artifact bytes with `Content-Type: application/pdf`,
`Content-Disposition: attachment; filename="..."`, and `Content-Length`. It preserves
vector content, all pages and their native dimensions. The item must belong to the
order in the URL. Download URLs are absolute authenticated API routes, never public
storage URLs.

The frontend should request the manifest as JSON, then fetch each file sequentially
using the same authenticated API client. The existing console `api` interceptor
returns `response.data` directly: manifest requests resolve to the JSON body and
file requests resolve to a Blob. For that client (already configured with admin
Authorization), use the manifest filename:

```js
const manifest = await api.get(
  `/admin/orders/${encodeURIComponent(orderNumber)}/print-pdf`,
  { responseType: 'json' },
);
for (const file of manifest.data.files) {
  let blob;
  try {
    blob = await api.get(file.download_url, { responseType: 'blob' });
  } catch (error) {
    // Axios receives API JSON errors as a Blob when responseType is blob.
    const body = error.response?.data;
    if (body instanceof Blob && body.type.includes('application/json')) {
      const detail = JSON.parse(await body.text());
      throw new Error(detail.message || 'Print PDF download failed');
    }
    throw error;
  }
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
```

This awaits each authenticated request before starting the next. Browsers may still
require permission for multiple downloads; frontend UI should handle this behavior.
A plain Axios client without that interceptor instead returns `response.data` for
the JSON body/Blob, and may use the `Content-Disposition` filename when the header
is exposed. Stop and display the API error when any request fails.

Manifest generation validates every artifact before returning any file list. Missing,
stale, corrupt or missing linked designs return `409` with the affected order item ID;
an order with no printable designs returns `409`. Unknown orders and foreign,
nonexistent or invalid item IDs return `404`; unauthenticated/non-admin callers
receive `401`/`403`. Existing limits remain: 200 documents, 100 MiB total, 200 pages
per manifest, and 1–20 pages / 25 MiB / 3000 mm per side per artifact. Manifest
validation releases each artifact's bytes before reading the next.

A manifest is a preflight check, not an immutable snapshot. Each individual download
validates its current artifact again and can return `409` if it became stale or was
removed; if regenerated for the current design, it returns that current artifact.
It validates only the selected item's artifact, so unrelated broken items do not
block a direct item download. `GET .../design-pdf` remains the existing inline design
preview endpoint.
