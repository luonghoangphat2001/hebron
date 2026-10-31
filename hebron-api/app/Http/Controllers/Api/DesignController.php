<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Design\StoreDesignRequest;
use App\Http\Requests\Design\UpdateDesignRequest;
use App\Models\DesignGroup;
use App\Models\OrderArtwork;
use App\Services\DesignPdfService;
use App\Services\DesignService;
use App\Services\PrintPdfService;
use App\Support\CommerceIdentity;
use App\Support\GuestCommerceToken;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DesignController extends BaseController
{
    public function __construct(
        protected DesignService $designService,
        protected DesignPdfService $designPdfService,
        protected PrintPdfService $printPdfService,
    ) {}

    protected function findArtworkForViewer(Request $request, int $id): OrderArtwork
    {
        $user = $request->user();
        $query = OrderArtwork::where('id', $id);

        if ($user?->isAdmin()) {
            return $query->firstOrFail();
        }

        if ($user) {
            $query->whereHas('designGroup', fn ($q) => $q->where('user_id', $user->id));
        } else {
            $query->whereHas('designGroup', fn ($q) => $q
                ->ownedByIdentity(CommerceIdentity::fromRequest($request)));
        }

        return $query->firstOrFail();
    }

    protected function findDesignGroupForViewer(Request $request, int $id): DesignGroup
    {
        $user = $request->user();
        $query = DesignGroup::where('id', $id);

        if ($user?->isAdmin()) {
            return $query->firstOrFail();
        }

        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            $query->ownedByIdentity(CommerceIdentity::fromRequest($request));
        }

        return $query->firstOrFail();
    }

    public function store(StoreDesignRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $designGroup = $this->designService->createDesignGroup(
                $request->user(),
                $data,
                GuestCommerceToken::fromRequest($request),
            );

            Log::channel('daily')->info('Design group created', [
                'event' => 'design_group.created',
                'design_group_id' => $designGroup->id,
                'product_id' => $designGroup->product_id,
                'user_id' => $designGroup->user_id,
                'request_ip' => $request->ip(),
                'guest_token_fingerprint' => GuestCommerceToken::fingerprint(
                    GuestCommerceToken::fromRequest($request)
                ),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Design created successfully',
                'data' => [
                    'design_group' => $this->formatDesignGrouphowResponse($designGroup),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $group = $this->findDesignGroupForViewer($request, $id);
            $includeLayout = $request->boolean('include_layout', false);

            return response()->json([
                'success' => true,
                'data' => $this->formatDesignGrouphowResponse($group, $includeLayout),
            ]);
        } catch (ModelNotFoundException $e) {
            Log::channel('daily')->warning('Design group lookup failed', [
                'event' => 'design_group.lookup_not_found',
                'design_group_id' => $id,
                'user_id' => $request->user()?->id,
                'request_ip' => $request->ip(),
                'guest_token_fingerprint' => GuestCommerceToken::fingerprint(
                    GuestCommerceToken::fromRequest($request)
                ),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Design not found',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function update(UpdateDesignRequest $request, int $id): JsonResponse
    {
        try {
            $group = $this->findDesignGroupForViewer($request, $id);

            $data = $request->validated();

            $group = DB::transaction(function () use ($group, $data) {
                $locked = DesignGroup::query()->lockForUpdate()->findOrFail($group->id);
                $locked->update($data);

                return $locked;
            });

            return response()->json([
                'success' => true,
                'message' => 'Design updated successfully',
                'data' => [
                    'design_group' => $this->formatDesignGrouphowResponse($group->fresh()),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Design not found',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $group = $this->findDesignGroupForViewer($request, $id);

            foreach ($group->orderArtworks as $artwork) {
                $this->designService->deleteDesign($artwork);
            }

            $group->delete();

            return response()->json([
                'success' => true,
                'message' => 'Design deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Design not found',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function uploadPrintPdf(Request $request, int $id): JsonResponse
    {
        // Validate outside the generic error handler so Laravel preserves 422 details.
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/pdf', 'max:25600'],
            'design_revision' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/'],
        ]);

        try {
            $group = $this->findDesignGroupForViewer($request, $id);
            $group = $this->printPdfService->store($group, $request->file('file'), $request->string('design_revision')->toString());

            return response()->json([
                'success' => true,
                'data' => ['design_group' => $this->formatDesignGrouphowResponse($group)],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Design not found'], 404);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], $this->resolveStatusCode($e));
        }
    }

    public function exportPdf(Request $request, int $id): Response
    {
        try {
            $group = $this->findDesignGroupForViewer($request, $id);
            $pdfContent = $this->designPdfService->buildPdf($group);
            $filename = 'design-'.preg_replace('/[^a-zA-Z0-9\-]/', '-', $group->title).'.pdf';

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($pdfContent),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Design not found'], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    protected function formatDesignGrouphowResponse(DesignGroup $group, bool $includeLayout = false): array
    {
        $response = [
            'id' => $group->id,
            'product_id' => $group->product_id,
            'title' => $group->title,
            'layout_data' => $group->layout_data,
            'layout_s3_path' => $group->layout_s3_path,
            'logo_path' => $group->logo_path,
            'preview_image_path' => $group->preview_image_path,
            'metadata' => $group->metadata,
            'design_revision' => PrintPdfService::revision($group),
            'print_pdf' => PrintPdfService::status($group),
            'created_at' => $group->created_at?->toISOString(),
            'updated_at' => $group->updated_at?->toISOString(),
        ];

        return $response;
    }
}
