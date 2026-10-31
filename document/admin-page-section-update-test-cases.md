# Test cases — PUT Admin Page Section

Endpoint:

```text
PUT /api/admin/pages/{siteType}/{pageType}/sections/{sectionType}
```

Base URL: `https://hebron-api.axndx.org`

Headers:

```http
Authorization: Bearer <admin-token>
Content-Type: application/json
Accept: application/json
```

## Preconditions

1. Có tài khoản admin hợp lệ.
2. Page và section tương ứng đã tồn tại trong database.
3. Lưu snapshot trước test: `title`, `subtitle`, `content`, `image`, `link`, `sort_order`, `is_active`, `metadata`.
4. Sau mỗi test, gọi `GET /api/admin/pages?site_type={siteType}&page_type={pageType}` để kiểm tra dữ liệu đã lưu và dữ liệu section được assembler resolve.

## Expected result chung cho case cập nhật hợp lệ

- HTTP `200`.
- Response báo cập nhật thành công và có `data.section`.
- `section_type` trong URL không bị thay đổi.
- Các field gửi lên được lưu đúng kiểu và đúng giá trị.
- `sort_order` và `is_active` được cập nhật đúng.
- Cache page bị invalidated; GET kế tiếp trả dữ liệu mới.

## 1. Happy-path matrix — toàn bộ section type

| ID | siteType / pageType | sectionType | Payload `content` tối thiểu hợp lệ |
|---|---|---|---|
| TC-01 | `SHOPPING_MALL/home_page` | `category_shortcuts` | `{"items":[{"icon":"https://example.com/icon.png","image_url":"https://example.com/banner.jpg","label":"Trophy","link":"Trophy","slug":"trophy"}]}` |
| TC-02 | `SHOPPING_MALL/home_page` | `category_product_showcase` | `{"category":"electronics","category_slug":"electronics","product_limit":8,"limit":8,"page_size":8}` |
| TC-03 | `SHOPPING_MALL/home_page` | `customer_center` | `{"intro":"Contact our customer center","phone":"028-1234-5678"}` |
| TC-04 | `SHOPPING_MALL/home_page` | `client_logos` | `{"items":[{"name":"Client A","image":"https://example.com/a.png"}]}` |
| TC-05 | `SHOPPING_MALL/order_lookup` | `order_lookup` | `{"title":"Order lookup","description":"Enter order number and phone"}` |
| TC-06 | `SHOPPING_MALL/terms` | `rich_text` | `{"html":"<p>Updated terms</p>","version":"2026-08-18"}` |
| TC-07 | `SHOPPING_MALL/privacy` | `rich_text` | `{"html":"<p>Updated privacy policy</p>","version":"2026-08-18"}` |
| TC-08 | `BRAND_SITE/home_page` | `client_logos` | `{"items":[{"name":"Client A","image":"https://example.com/a.png"}]}` |
| TC-09 | `BRAND_SITE/home_page` | `brand_statement` | `{"headline":"Built for better production","body":"Our brand statement"}` |
| TC-10 | `BRAND_SITE/home_page` | `custom_process` | `{"steps":[{"title":"Consulting","description":"Understand requirements"}]}` |
| TC-11 | `BRAND_SITE/home_page` | `press_preview` | `{"items":[{"title":"Press release","url":"https://example.com/news/1"}]}` |
| TC-12 | `BRAND_SITE/home_page` | `manufacturing_process` | `{"steps":[{"title":"Inspection","description":"Quality inspection"}]}` |
| TC-13 | `BRAND_SITE/home_page` | `about_cta` | `{"headline":"Learn about us","button_text":"View story"}` |
| TC-14 | `BRAND_SITE/brand_story` | `brand_identity` | `{"mission":"Make production simpler","values":["Quality","Trust"]}` |
| TC-15 | `BRAND_SITE/brand_story` | `company_history` | `{"intro":"Our story","timeline":[{"year":"2000","title":"Founded","description":"Company founded"}]}` |
| TC-16 | `BRAND_SITE/brand_story` | `certificates` | `{"items":[{"name":"ISO 9001","image":"https://example.com/iso.png"}]}` |
| TC-17 | `BRAND_SITE/portfolio_detail` | `project_overview` | `{"client":"Client A","summary":"Project summary","services":["Design","Production"]}` |
| TC-18 | `BRAND_SITE/process` | `process_steps` | `{"steps":[{"order":1,"title":"Plan","description":"Plan production"}]}` |
| TC-19 | `BRAND_SITE/process` | `production_video` | `{"url":"https://example.com/video.mp4","poster":"https://example.com/poster.jpg"}` |
| TC-20 | `BRAND_SITE/process` | `equipment_gallery` | `{"items":[{"title":"Machine A","image":"https://example.com/machine-a.png"}]}` |
| TC-21 | `BRAND_SITE/process` | `quality_control` | `{"headline":"Quality first","items":[{"title":"Inspection","description":"Final inspection"}]}` |
| TC-22 | `BRAND_SITE/process` | `about_cta` | `{"headline":"See our capabilities","button_text":"Learn more"}` |
| TC-23 | `BRAND_SITE/media` | `media_list` | `{"items":[{"title":"Media item","url":"https://example.com/media/1"}]}` |
| TC-24 | `BRAND_SITE/media` | `brand_videos` | `{"items":[{"title":"Brand film","url":"https://example.com/brand.mp4"}]}` |
| TC-25 | `BRAND_SITE/media` | `sns_links` | `{"items":[{"platform":"facebook","url":"https://facebook.com/example"}]}` |
| TC-26 | `BRAND_SITE/media` | `about_cta` | `{"headline":"Discover our story","button_text":"About us"}` |
| TC-27 | `BRAND_SITE/contact_us` | `hero_section` | `{"headline":"Contact us","description":"We are here to help"}` |
| TC-28 | `BRAND_SITE/contact_us` | `contact_information` | `{"address":"123 Example Street","email":"hello@example.com","phone":"028-1234-5678"}` |
| TC-29 | `BRAND_SITE/contact_us` | `contact_form` | `{"fields":[{"name":"name","required":true},{"name":"email","required":true}]}` |
| TC-30 | `BRAND_SITE/contact_us` | `achievement_cta` | `{"headline":"Ready to start?","button_text":"Send inquiry"}` |
| TC-31 | `BRAND_SITE/production_inquiry` | `inquiry_form` | `{"fields":[{"name":"company","required":true},{"name":"message","required":true}]}` |

Use this common wrapper for each row:

```json
{
  "section_type": "<same-as-path-sectionType>",
  "title": "Updated title",
  "subtitle": "Updated subtitle",
  "content": "<content-from-matrix>",
  "image": "https://example.com/uploads/section.jpg",
  "link": "https://example.com/updated",
  "sort_order": 99,
  "is_active": true,
  "metadata": {"layout":"test-layout","updated_by":"api-test"}
}
```

`content` may be sent as a JSON object with `application/json`; for multipart requests, send `content` and `metadata` as JSON strings.

## 2. Field and persistence cases

| ID | Test | Expected |
|---|---|---|
| TC-32 | Chỉ gửi `title` | 200; các field khác giữ nguyên |
| TC-33 | Gửi `subtitle`, `image`, `link`, `sort_order`, `is_active`, `metadata` cùng lúc | 200; tất cả lưu đúng |
| TC-34 | Gửi `is_active=false` | 200; section bị inactive nhưng record không bị xóa |
| TC-35 | Gửi `sort_order=0` | 200 |
| TC-36 | Gửi `content` và `metadata` là JSON string hợp lệ | 200; server decode thành object |
| TC-37 | Gửi field ngoài allow-list | 200 hoặc bị bỏ qua theo policy; không được ghi field ngoài allow-list |
| TC-38 | Gửi `section_type` trùng path | 200 |
| TC-39 | Gửi `section_type` khác path | 422, message `section_type cannot be changed.` |

## 3. Validation and negative cases

| ID | Request variation | Expected |
|---|---|---|
| TC-40 | Không có Bearer token | 401 |
| TC-41 | Token user không có quyền admin | 403 |
| TC-42 | `siteType=INVALID` | 404 hoặc 422 theo route/error handler |
| TC-43 | `pageType` không thuộc siteType | 404 |
| TC-44 | `sectionType` không tồn tại trong page | 404 |
| TC-45 | Section hợp lệ nhưng không thuộc page/site combination | 422, `This section is not registered for the selected page.` |
| TC-46 | Body rỗng `{}` | 200 nếu API cho phép no-op; cần xác nhận không làm mất dữ liệu |
| TC-47 | `title` dài 256 ký tự | 422 |
| TC-48 | `sort_order=-1` | 422 |
| TC-49 | `sort_order="abc"` | 422 |
| TC-50 | `is_active="abc"` | 422 |
| TC-51 | `content` là string không phải JSON | 422 vì không phải array sau validation |
| TC-52 | `metadata` là JSON không hợp lệ | 422 |
| TC-53 | JSON malformed / thiếu dấu ngoặc | 400 hoặc 422 |
| TC-54 | `category_shortcuts.content.category` là object | 422 |
| TC-55 | `category_shortcuts.content.category` là array chứa phần tử không phải string | 422 |
| TC-56 | `category_shortcuts.content.category_slugs` có hơn 100 phần tử | 422 |
| TC-57 | `category_product_showcase.content.product_limit=0` | 422 |
| TC-58 | `category_product_showcase.content.product_limit=101` | 422 |
| TC-59 | `category_product_showcase.content.limit=101` hoặc `page_size=101` | 422 |
| TC-60 | Gửi `section_type` là section hệ thống không hỗ trợ (`product_catalog`, `portfolio_list`) | Route không match hoặc 404; không được cập nhật |
| TC-61 | `product_preview` với `content.product_ids=[12,15]` | 200; trả đúng product active theo thứ tự ID |
| TC-62 | `product_preview` không có `product_ids` | 200; tự lấy product theo category/config hiện có |
| TC-63 | `notices_preview` với `content.notice_ids=[4,9]` | 200; trả đúng notice active, published, đúng site |
| TC-64 | `notices_preview` không có `notice_ids` | 200; tự lấy notice theo thứ tự pinned/published |
| TC-65 | `faq_section` với `content.faq_ids=[2,5]` | 200; trả đúng FAQ active, đúng site |
| TC-66 | `faq_section` không có `faq_ids` | 200; tự lấy FAQ theo `sort_order` |
| TC-67 | `portfolio_preview` với `content.portfolio_ids=[7,3]` | 200; trả đúng Portfolio active, đúng site và đúng thứ tự ID |
| TC-68 | `portfolio_preview` không có `portfolio_ids` | 200; tự lấy Portfolio featured trước, sau đó theo `sort_order` |

## 4. Multipart regression

Chạy ít nhất TC-01, TC-15 và TC-28 với `Content-Type: multipart/form-data`, trong đó:

- `content` là JSON string.
- `metadata` là JSON string.
- `image` là URL đã trả về từ `/api/files`.
- Kỳ vọng HTTP `200` và dữ liệu GET sau update giống JSON request.

## 5. Regression cần lưu ý

1. `brand_statement` có trong `SectionType::valuesForManualUpdate()` và route backend nhưng chưa có trong danh sách enum của Swagger. Cần bổ sung Swagger hoặc xác nhận chủ ý loại bỏ.
2. `hero_section` cho phép cập nhật thủ công; riêng `content.items` vẫn được assembler resolve từ banner theo site/page khi trả dữ liệu.
3. `PLAIN_SITE/home_page` có `hero_section` cập nhật thủ công được; `product_catalog` vẫn là section system-resolved.
4. `BRAND_SITE/portfolio` chỉ có `portfolio_list`, cũng là system-resolved; không đưa vào happy path.
5. `product_preview`, `notices_preview`, `portfolio_preview`, và `faq_section` cho phép cấu hình ID tùy chọn; nếu không truyền ID thì backend tự resolve dữ liệu như trước.
6. `category_shortcuts` lưu và trả về `content.items` được quản lý thủ công; `category_product_showcase` vẫn resolve danh sách category/product từ cấu hình category.
