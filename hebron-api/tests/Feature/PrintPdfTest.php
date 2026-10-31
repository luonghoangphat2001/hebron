<?php

namespace Tests\Feature;

use App\Http\Resources\Admin\AdminDesignGroupResource;
use App\Models\DesignGroup;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Admin\OrderDesignPdfService;
use App\Services\Admin\OrderPrintPdfService;
use App\Services\PrintPdfService;
use App\Support\GuestCommerceToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class PrintPdfTest extends TestCase
{
    use RefreshDatabase;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        config(['filesystems.print_pdf_disk' => 'local', 'filesystems.public_disk' => 'public']);
        Storage::fake('local');
        Storage::fake('public');
        $this->token = str_repeat('p', 64);
        $this->withHeader(GuestCommerceToken::HEADER, $this->token);
    }

    private function group(): DesignGroup
    {
        return DesignGroup::create([
            'title' => 'Vector design',
            'guest_token_hash' => GuestCommerceToken::hash($this->token),
            'metadata' => ['schema' => 'hebron-product-design-v1', 'layers' => [['type' => 'text', 'text' => 'Hello']]],
        ]);
    }

    private function pdf(float $width = 90, float $height = 50, bool $back = false): string
    {
        $pdf = new \FPDF('L', 'mm', [$height, $width]);
        $pdf->AddPage();
        $pdf->SetFont('Helvetica', '', 12);
        $pdf->Text(10, 15, 'Vector text');
        $pdf->Rect(5, 5, 60, 25);
        if ($back) {
            $pdf->AddPage();
            $pdf->Text(10, 15, 'Vector back');
        }

        return $pdf->Output('S');
    }

    private function upload(DesignGroup $group, string $bytes, ?string $revision = null)
    {
        return $this->post('/api/designs/'.$group->id.'/print-pdf', [
            'file' => UploadedFile::fake()->createWithContent('print.pdf', $bytes),
            'design_revision' => $revision ?? PrintPdfService::revision($group),
        ], ['Accept' => 'application/json']);
    }

    public function test_guest_upload_round_trip_is_private_and_byte_identical_and_overwrites(): void
    {
        $group = $this->group();
        $bytes = $this->pdf();
        $this->upload($group, $bytes)->assertOk()->assertJsonPath('data.design_group.print_pdf.available', true);
        $path = 'designs/print-pdfs/'.$group->id.'/print.pdf';
        $stored = Storage::disk('local')->get($path);
        $this->get('/api/designs/'.$group->id.'/export-pdf')->assertOk()->assertContent($stored);
        $this->assertStringContainsString('/Subtype /Form', $stored);
        $this->assertStringNotContainsString('/Subtype /Image', $stored);
        $this->assertSame('private', Storage::disk('local')->getVisibility($path));
        $this->upload($group, $this->pdf(120, 70))->assertOk();
        $this->assertCount(1, Storage::disk('local')->allFiles());
        $this->getJson('/api/designs/'.$group->id)->assertOk()->assertJsonMissingPath('data.print_pdf_path');
        $group->delete();
        Storage::disk('local')->assertMissing($path);
    }

    public function test_stale_upload_and_download_are_rejected_after_design_changes(): void
    {
        $group = $this->group();
        $revision = PrintPdfService::revision($group);
        $this->upload($group, $this->pdf())->assertOk();
        $this->putJson('/api/designs/'.$group->id, ['metadata' => ['schema' => 'hebron-product-design-v1', 'layers' => []]])
            ->assertOk()->assertJsonPath('data.design_group.print_pdf.available', false);
        $this->upload($group, $this->pdf(), $revision)->assertStatus(409);
        $this->getJson('/api/designs/'.$group->id.'/export-pdf')->assertStatus(409);
    }

    public function test_cross_guest_upload_and_download_are_not_allowed(): void
    {
        $group = $this->group();
        $this->withHeader(GuestCommerceToken::HEADER, str_repeat('x', 64));
        $this->upload($group, $this->pdf())->assertNotFound();
        $this->getJson('/api/designs/'.$group->id.'/export-pdf')->assertNotFound();
        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_malformed_pdf_and_excessive_page_count_are_rejected(): void
    {
        $group = $this->group();
        $this->upload($group, "%PDF-1.7\nnot a PDF\n%%EOF")->assertUnprocessable();
        $pdf = new \FPDF;
        for ($i = 0; $i < 21; $i++) {
            $pdf->AddPage();
        }
        $this->upload($group, $pdf->Output('S'))->assertUnprocessable();
    }

    public function test_missing_new_editor_artifact_is_not_silently_rasterized(): void
    {
        $group = $this->group();
        $this->getJson('/api/designs/'.$group->id.'/export-pdf')->assertStatus(409);
    }

    public function test_order_merge_keeps_all_pages_and_native_dimensions(): void
    {
        $groups = [$this->group(), $this->group()];
        foreach ($groups as $i => $group) {
            $this->upload($group, $this->pdf(90 + $i * 30, 50 + $i * 20))->assertOk();
        }
        $order = new Order(['order_number' => 'PRINT-001']);
        $order->setRelation('items', collect(array_map(function ($group) {
            $item = new OrderItem;
            $item->setRelation('designGroup', $group->fresh());

            return $item;
        }, $groups)));
        $bytes = app(OrderDesignPdfService::class)->buildPdf($order);
        $pdf = new Fpdi;
        $this->assertSame(2, $pdf->setSourceFile(StreamReader::createByString($bytes)));
        foreach ([1 => [90, 50], 2 => [120, 70]] as $page => [$width, $height]) {
            $size = $pdf->getTemplateSize($pdf->importPage($page));
            $this->assertEqualsWithDelta($width, $size['width'], 0.01);
            $this->assertEqualsWithDelta($height, $size['height'], 0.01);
        }
        $this->assertStringContainsString('/Subtype /Form', $bytes);
        $this->assertStringNotContainsString('/Subtype /Image', $bytes);
    }

    public function test_revision_is_key_order_independent_and_ignores_title(): void
    {
        $group = new DesignGroup(['metadata' => ['a' => 1, 'b' => 2]]);
        $revision = PrintPdfService::revision($group);
        $group->metadata = ['b' => 2, 'a' => 1];
        $group->title = 'New title';
        $this->assertSame($revision, PrintPdfService::revision($group));
    }

    public function test_modified_storage_bytes_fail_closed(): void
    {
        $group = $this->group();
        $this->upload($group, $this->pdf())->assertOk();
        Storage::disk('local')->put('designs/print-pdfs/'.$group->id.'/print.pdf', $this->pdf(120, 70));
        $this->getJson('/api/designs/'.$group->id.'/export-pdf')->assertStatus(409);
    }

    public function test_upload_rebuild_discards_document_javascript_actions(): void
    {
        $group = $this->group();
        $pdf = new class extends \FPDF
        {
            protected function _putcatalog()
            {
                parent::_putcatalog();
                $this->_put('/OpenAction << /S /JavaScript /JS (test-script) >>');
            }
        };
        $pdf->AddPage();
        $pdf->SetFont('Helvetica', '', 12);
        $pdf->Text(10, 10, 'Safe visible text');
        $original = $pdf->Output('S');
        $this->assertStringContainsString('/JavaScript', $original);
        $this->upload($group, $original)->assertOk();
        $stored = Storage::disk('local')->get('designs/print-pdfs/'.$group->id.'/print.pdf');
        $this->assertStringNotContainsString('/JavaScript', $stored);
        $this->assertStringNotContainsString('/OpenAction', $stored);
        $this->assertStringContainsString('/Subtype /Form', $stored);
    }

    public function test_legacy_design_without_vector_metadata_keeps_preview_fallback(): void
    {
        $group = $this->group();
        $group->update(['metadata' => []]);
        $this->get('/api/designs/'.$group->id.'/export-pdf')->assertOk()->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_authenticated_owner_can_upload_but_other_member_cannot(): void
    {
        $owner = User::factory()->create(['username' => 'pdf-owner']);
        $other = User::factory()->create(['username' => 'pdf-other']);
        $group = $this->group();
        $group->update(['user_id' => $owner->id, 'guest_token_hash' => null]);
        Sanctum::actingAs($other);
        $this->upload($group, $this->pdf())->assertNotFound();
        Sanctum::actingAs($owner);
        $this->upload($group, $this->pdf())->assertOk();
        $this->get('/api/designs/'.$group->id.'/export-pdf')->assertOk();
    }

    public function test_admin_route_is_admin_protected(): void
    {
        $route = app('router')->getRoutes()->match(Request::create('/api/admin/orders/ABC/design-pdf', 'GET'));
        $this->assertContains('auth:sanctum', $route->gatherMiddleware());
        $this->assertContains('user.admin', $route->gatherMiddleware());
    }

    private function admin(): void
    {
        Sanctum::actingAs(User::factory()->create(['username' => 'print-admin', 'authority' => 'super_admin']));
    }

    private function orderWithDesign(?DesignGroup $group = null): Order
    {
        $order = Order::create([
            'order_number' => 'PRINT-001',
            'contact_name' => 'Print buyer',
            'contact_phone' => '01000000000',
            'contact_phone2' => '',
        ]);
        $order->items()->create(['quantity' => 4, 'design_group_id' => $group?->id]);

        return $order;
    }

    public function test_strict_admin_routes_require_authentication_and_admin_authority(): void
    {
        $urls = ['/api/admin/orders/ABC/print-pdf', '/api/admin/orders/ABC/items/1/print-pdf'];
        foreach ($urls as $url) {
            $route = app('router')->getRoutes()->match(Request::create($url, 'GET'));
            $this->assertContains('auth:sanctum', $route->gatherMiddleware());
            $this->assertContains('user.admin', $route->gatherMiddleware());
            $this->getJson($url)->assertUnauthorized();
        }
        Sanctum::actingAs(User::factory()->create(['username' => 'print-member']));
        foreach ($urls as $url) {
            $this->getJson($url)->assertForbidden();
        }
    }

    public function test_strict_order_download_rejects_legacy_artifact_but_preview_remains_available(): void
    {
        $group = $this->group();
        $group->update(['metadata' => []]);
        $order = $this->orderWithDesign($group);
        $itemId = $order->items()->first()->id;
        $this->admin();
        $response = $this->getJson('/api/admin/orders/PRINT-001/print-pdf')->assertStatus(409);
        $this->assertStringContainsString('Order item '.$itemId, $response->json('message'));
        $this->assertStringContainsString('regenerate', $response->json('message'));
        $this->get('/api/admin/orders/PRINT-001/design-pdf')->assertOk()
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('Content-Disposition', 'inline; filename="design-PRINT-001.pdf"');
    }

    public function test_strict_order_without_designs_returns_conflict_and_unknown_order_is_not_found(): void
    {
        $this->orderWithDesign();
        $this->admin();
        $this->getJson('/api/admin/orders/PRINT-001/print-pdf')->assertStatus(409)
            ->assertJsonPath('message', 'This order has no designs to print. Add a design and generate its print PDF in the editor.');
        $this->getJson('/api/admin/orders/DOES-NOT-EXIST/print-pdf')->assertNotFound();
        Order::where('order_number', 'PRINT-001')->firstOrFail()->items()->delete();
        $this->getJson('/api/admin/orders/PRINT-001/print-pdf')->assertStatus(409);
    }

    public function test_manifest_orders_items_skips_no_design_and_preserves_individual_original_pdfs(): void
    {
        $first = $this->group();
        $second = $this->group();
        $this->upload($first, $this->pdf(90, 50, true))->assertOk();
        $this->upload($second, $this->pdf(120, 70))->assertOk();
        $order = $this->orderWithDesign($first);
        $order->items()->create(['quantity' => 3]);
        $order->items()->create(['quantity' => 8, 'design_group_id' => $second->id]);
        $order->items()->create(['quantity' => 2, 'design_group_id' => $first->id]);
        $order->load('items.designGroup');
        $order->setRelation('items', $order->items->reverse());
        $expected = app(OrderPrintPdfService::class)->manifest($order);
        $this->admin();
        $response = $this->getJson('/api/admin/orders/PRINT-001/print-pdf')->assertOk()
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('data.order_number', 'PRINT-001')
            ->assertJsonPath('data.files', $expected);
        $files = $response->json('data.files');
        $this->assertCount(3, $files);
        $this->assertSame($order->items->whereNotNull('design_group_id')->sortBy('id')->pluck('id')->all(), array_column($files, 'order_item_id'));
        $this->assertSame([$first->id, $second->id, $first->id], array_column($files, 'design_group_id'));
        $this->assertCount(3, array_unique(array_column($files, 'filename')));
        foreach ($files as $file) {
            $bytes = Storage::disk('local')->get('designs/print-pdfs/'.$file['design_group_id'].'/print.pdf');
            $download = $this->get($file['download_url'])->assertOk()->assertContent($bytes)
                ->assertHeader('Content-Type', 'application/pdf')
                ->assertHeader('Content-Disposition', 'attachment; filename="'.$file['filename'].'"')
                ->assertHeader('Content-Length', (string) strlen($bytes));
            $pdf = new Fpdi;
            $isFirst = $file['design_group_id'] === $first->id;
            $this->assertSame($isFirst ? 2 : 1, $pdf->setSourceFile(StreamReader::createByString($download->getContent())));
            for ($page = 1; $page <= ($isFirst ? 2 : 1); $page++) {
                $size = $pdf->getTemplateSize($pdf->importPage($page));
                $this->assertEqualsWithDelta($isFirst ? 90 : 120, $size['width'], 0.01);
                $this->assertEqualsWithDelta($isFirst ? 50 : 70, $size['height'], 0.01);
            }
            $this->assertStringContainsString('/Subtype /Form', $bytes);
            $this->assertStringNotContainsString('/Subtype /Image', $bytes);
        }
    }

    public function test_item_download_is_order_scoped_and_rejects_invalid_ids(): void
    {
        $group = $this->group();
        $this->upload($group, $this->pdf())->assertOk();
        $order = $this->orderWithDesign($group);
        $itemId = $order->items()->first()->id;
        $other = Order::create(['order_number' => 'OTHER-001', 'contact_name' => 'Other', 'contact_phone' => '01000000000', 'contact_phone2' => '']);
        $otherItem = $other->items()->create(['quantity' => 1, 'design_group_id' => $group->id]);
        $this->admin();
        foreach ([$otherItem->id, '999999', 'invalid', '-1', '1.5', '1e0', '0'] as $invalidId) {
            $this->getJson('/api/admin/orders/PRINT-001/items/'.$invalidId.'/print-pdf')->assertNotFound();
        }
        $this->getJson('/api/admin/orders/MISSING/items/'.$itemId.'/print-pdf')->assertNotFound();
        $this->get('/api/admin/orders/PRINT-001/items/'.$itemId.'/print-pdf')->assertOk();
        $emptyItem = $order->items()->create(['quantity' => 1]);
        $this->getJson('/api/admin/orders/PRINT-001/items/'.$emptyItem->id.'/print-pdf')->assertStatus(409);
    }

    public function test_manifest_validates_all_items_but_item_download_validates_only_its_own_artifact(): void
    {
        $valid = $this->group();
        $missing = $this->group();
        $this->upload($valid, $this->pdf())->assertOk();
        $order = $this->orderWithDesign($valid);
        $validId = $order->items()->first()->id;
        $invalid = $order->items()->create(['quantity' => 1, 'design_group_id' => $missing->id]);
        $this->admin();
        $response = $this->getJson('/api/admin/orders/PRINT-001/print-pdf')->assertStatus(409);
        $this->assertStringContainsString('Order item '.$invalid->id, $response->json('message'));
        $this->get('/api/admin/orders/PRINT-001/items/'.$validId.'/print-pdf')->assertOk();
        $this->getJson('/api/admin/orders/PRINT-001/items/'.$invalid->id.'/print-pdf')->assertStatus(409);
    }

    public function test_strict_download_fails_with_item_context_for_missing_stale_and_damaged_artifacts(): void
    {
        $group = $this->group();
        $this->upload($group, $this->pdf())->assertOk();
        $order = $this->orderWithDesign($group);
        $itemId = $order->items()->first()->id;
        $path = 'designs/print-pdfs/'.$group->id.'/print.pdf';
        $original = Storage::disk('local')->get($path);
        $this->admin();
        $urls = ['/api/admin/orders/PRINT-001/print-pdf', '/api/admin/orders/PRINT-001/items/'.$itemId.'/print-pdf'];
        $this->getJson($urls[0])->assertOk();
        Storage::disk('local')->delete($path);
        foreach ($urls as $url) {
            $response = $this->getJson($url)->assertStatus(409);
            $this->assertStringContainsString('Order item '.$itemId, $response->json('message'));
        }
        Storage::disk('local')->put($path, $this->pdf(120, 70));
        foreach ($urls as $url) {
            $response = $this->getJson($url)->assertStatus(409);
            $this->assertStringContainsString('Order item '.$itemId, $response->json('message'));
        }
        // Also reject malformed bytes even if database digest matches them.
        $corrupt = "%PDF-1.7\nnot a PDF\n%%EOF";
        Storage::disk('local')->put($path, $corrupt);
        $group->update(['print_pdf_digest' => hash('sha256', $corrupt)]);
        foreach ($urls as $url) {
            $response = $this->getJson($url)->assertStatus(409);
            $this->assertStringContainsString('Order item '.$itemId, $response->json('message'));
        }
        Storage::disk('local')->put($path, $original);
        $group->update(['print_pdf_digest' => hash('sha256', $original), 'metadata' => ['schema' => 'hebron-product-design-v1', 'layers' => []]]);
        foreach ($urls as $url) {
            $response = $this->getJson($url)->assertStatus(409);
            $this->assertStringContainsString('Order item '.$itemId, $response->json('message'));
        }
    }

    public function test_strict_download_does_not_skip_a_missing_linked_design(): void
    {
        $order = new Order(['order_number' => 'PRINT-001']);
        $item = new OrderItem(['design_group_id' => 123, 'quantity' => 1]);
        $item->id = 17;
        $item->setRelation('designGroup', null);
        $order->setRelation('items', collect([$item]));
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Order item 17: linked design is missing');
        app(OrderPrintPdfService::class)->manifest($order);
    }

    public function test_admin_design_resource_exposes_revision_and_status_without_private_storage_fields(): void
    {
        $group = $this->group();
        $data = (new AdminDesignGroupResource($group))->resolve();
        $this->assertSame(PrintPdfService::revision($group), $data['design_revision']);
        $this->assertSame(['available' => false, 'revision' => null], $data['print_pdf']);
        $this->upload($group, $this->pdf())->assertOk();
        $group->refresh();
        $data = (new AdminDesignGroupResource($group))->resolve();
        $this->assertSame(PrintPdfService::status($group), $data['print_pdf']);
        $this->assertTrue($data['print_pdf']['available']);
        $this->assertArrayNotHasKey('print_pdf_path', $data);
        $this->assertArrayNotHasKey('print_pdf_digest', $data);
        $group->update(['metadata' => []]);
        $data = (new AdminDesignGroupResource($group))->resolve();
        $this->assertFalse($data['print_pdf']['available']);
    }

    public function test_strict_single_download_is_identical_and_filename_is_sanitized(): void
    {
        $group = $this->group();
        $this->upload($group, $this->pdf())->assertOk();
        $order = $this->orderWithDesign($group);
        $order->update(['order_number' => 'PRINT:001']);
        $this->admin();
        $bytes = Storage::disk('local')->get('designs/print-pdfs/'.$group->id.'/print.pdf');
        $itemId = $order->items()->first()->id;
        $manifest = $this->getJson('/api/admin/orders/PRINT%3A001/print-pdf')->assertOk();
        $filename = 'order-PRINT-001-item-'.$itemId.'-design-'.$group->id.'-print.pdf';
        $manifest->assertJsonPath('data.files.0.filename', $filename);
        $this->get($manifest->json('data.files.0.download_url'))->assertOk()->assertContent($bytes)
            ->assertHeader('Content-Disposition', 'attachment; filename="'.$filename.'"')
            ->assertHeader('Content-Length', (string) strlen($bytes));
    }

    public function test_strict_order_preserves_aggregate_document_limit(): void
    {
        $group = $this->group();
        $this->upload($group, $this->pdf())->assertOk();
        $order = new Order(['order_number' => 'PRINT-001']);
        $items = collect();
        for ($i = 1; $i <= 201; $i++) {
            $item = new OrderItem(['design_group_id' => $group->id]);
            $item->id = $i;
            $item->setRelation('designGroup', $group);
            $items->push($item);
        }
        $order->setRelation('items', $items);
        try {
            app(OrderPrintPdfService::class)->manifest($order);
            $this->fail('The document limit must be enforced.');
        } catch (HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
            $this->assertStringContainsString('200 documents', $e->getMessage());
        }
    }

    public function test_strict_order_preserves_aggregate_page_limit(): void
    {
        $group = $this->group();
        $pdf = new \FPDF;
        for ($i = 0; $i < 20; $i++) {
            $pdf->AddPage();
        }
        $this->upload($group, $pdf->Output('S'))->assertOk();
        $order = new Order(['order_number' => 'PRINT-001']);
        $items = collect();
        for ($i = 1; $i <= 11; $i++) {
            $item = new OrderItem(['design_group_id' => $group->id]);
            $item->id = $i;
            $item->setRelation('designGroup', $group);
            $items->push($item);
        }
        $order->setRelation('items', $items);
        try {
            app(OrderPrintPdfService::class)->manifest($order);
            $this->fail('The page limit must be enforced.');
        } catch (HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
            $this->assertStringContainsString('200 pages', $e->getMessage());
        }
    }
}
