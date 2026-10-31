<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminTemplateExport;
use App\Http\Requests\Admin\Template\AdminPreviewImageUploadRequest;
use App\Http\Requests\Admin\Template\AdminTemplateBulkDeleteRequest;
use App\Http\Requests\Admin\Template\AdminTemplateBulkUpdateRequest;
use App\Http\Requests\Admin\Template\AdminTemplateCopyRequest;
use App\Http\Requests\Admin\Template\AdminTemplateExportRequest;
use App\Http\Requests\Admin\Template\AdminTemplateFileUploadRequest;
use App\Http\Requests\Admin\Template\AdminTemplateListRequest;
use App\Http\Requests\Admin\Template\AdminTemplatePreviewUpsertRequest;
use App\Http\Requests\Admin\Template\AdminTemplateStoreRequest;
use App\Http\Requests\Admin\Template\AdminTemplateUpdateRequest;
use App\Http\Resources\Admin\AdminFileResource;
use App\Http\Resources\Admin\AdminTemplateResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminTemplateService;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminTemplateController extends BaseController
{
    public function __construct(
        protected AdminTemplateService $adminTemplateService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,
        protected FileService $fileService,
    ) {}

    /**
     * Get search filter options for templates
     * 템플릿 목록 검색 필터 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminTemplateService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => [
                    'filters' => $filters,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Upload preview images (max 1 image). For Template List / create / update preview_images field.
     */
    public function uploadPreviewImages(AdminPreviewImageUploadRequest $request): JsonResponse
    {
        try {
            $files = $request->file('images');
            $files = is_array($files) ? $files : ($files ? [$files] : []);

            $paths = [];
            foreach ($files as $file) {
                $path = $file->store('templates/previews', config('filesystems.public_disk'));
                $paths[] = Storage::disk(config('filesystems.public_disk'))->url($path);
                $this->fileService->create($file, $path, FileType::TEMPLATE_PREVIEWS, $request->user());
            }

            return response()->json([
                'success' => true,
                'message' => '미리보기 이미지가 성공적으로 업로드되었습니다.',
                'data' => [
                    'preview_images' => $paths,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Upsert template preview image by side using a stable storage key.
     */
    public function upsertPreview(AdminTemplatePreviewUpsertRequest $request, int $id): JsonResponse
    {
        try {
            $template = $this->adminTemplateService->getTemplate($id);
            $side = $request->validated('side');
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'png');
            $path = "templates/{$template->id}/preview-{$side}.{$extension}";

            $disk = Storage::disk(config('filesystems.public_disk'));
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $candidateExtension) {
                $candidatePath = "templates/{$template->id}/preview-{$side}.{$candidateExtension}";
                if ($candidatePath !== $path && $disk->exists($candidatePath)) {
                    $disk->delete($candidatePath);
                }
            }

            $disk->putFileAs("templates/{$template->id}", $file, "preview-{$side}.{$extension}");

            $frontPreviewUrl = $side === 'front' ? $path : $template->front_preview_url;
            $backPreviewUrl = $side === 'back' ? $path : $template->back_preview_url;
            $previewImages = array_values(array_filter([
                $frontPreviewUrl,
                $backPreviewUrl,
            ]));

            $template->forceFill([
                'front_preview_url' => $frontPreviewUrl,
                'back_preview_url' => $backPreviewUrl,
                'preview_images' => $previewImages,
                'updated_at' => now(),
            ])->save();

            $template->refresh();
            $version = $template->updated_at?->format('YmdHis') ?? now()->format('YmdHis');

            return response()->json([
                'success' => true,
                'message' => '템플릿 미리보기 이미지가 저장되었습니다.',
                'data' => [
                    'side' => $side,
                    'path' => $path,
                    'url' => $disk->url($path).'?v='.$version,
                    'preview_images' => $previewImages,
                    'front_preview_url' => $frontPreviewUrl,
                    'back_preview_url' => $backPreviewUrl,
                ],
            ], 200);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => '템플릿을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Upload template source file or editor asset.
     * Returns file_path for use in template create/update layout_config.
     */
    public function uploadFile(AdminTemplateFileUploadRequest $request): JsonResponse
    {
        try {
            $path = $request->file('file')->store('templates', config('filesystems.public_disk'));
            $file = $this->fileService->create($request->file('file'), $path, FileType::TEMPLATES, $request->user());

            return response()->json([
                'success' => true,
                'message' => '템플릿 파일이 업로드되었습니다.',
                'data' => [
                    'file_path' => $file->url,
                    'file' => new AdminFileResource($file),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get template list for admin with filters
     * 템플릿 목록 조회 (관리자)
     */
    public function index(AdminTemplateListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $templates = $this->adminTemplateService->getTemplates($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $this->adminTemplateService->formatListResponse($templates),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get template detail for admin
     * 템플릿 상세 조회 (관리자)
     */
    public function show(int $id): JsonResponse
    {
        try {
            $template = $this->adminTemplateService->getTemplate($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'template' => new AdminTemplateResource($template),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '템플릿을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create a new template
     * 템플릿 등록
     */
    public function store(AdminTemplateStoreRequest $request): JsonResponse
    {
        try {
            $adminUser = $request->user();
            $data = $request->validated();

            $template = $this->adminTemplateService->createTemplate($adminUser, $data);

            return response()->json([
                'success' => true,
                'message' => '템플릿이 성공적으로 생성되었습니다.',
                'data' => [
                    'template' => new AdminTemplateResource($template->load(['product', 'background', 'createdBy'])),
                ],
            ], 201);
        } catch (\Throwable $e) {
            \Log::info($e);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update an existing template
     * 템플릿 수정
     */
    public function update(AdminTemplateUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $template = $this->adminTemplateService->updateTemplate($id, $data, $request->user());

            return response()->json([
                'success' => true,
                'message' => '템플릿이 성공적으로 수정되었습니다.',
                'data' => [
                    'template' => new AdminTemplateResource($template),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '템플릿을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Delete a template (soft delete)
     * 템플릿 삭제
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminTemplateService->deleteTemplate($id);

            return response()->json([
                'success' => true,
                'message' => '템플릿이 성공적으로 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk update templates.
     * 템플릿 일괄 수정 (관리자)
     */
    public function bulkUpdate(AdminTemplateBulkUpdateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->adminTemplateService->bulkUpdate(
                $validated['template_ids'],
                $validated['field'],
                $validated['value']
            );

            return response()->json([
                'success' => true,
                'message' => '템플릿이 성공적으로 수정되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk delete templates (soft delete).
     * 템플릿 일괄 삭제 (관리자)
     */
    public function bulkDelete(AdminTemplateBulkDeleteRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->adminTemplateService->bulkDelete($validated['template_ids']);

            return response()->json([
                'success' => true,
                'message' => '템플릿이 성공적으로 삭제되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get copy preview data for template copy modal.
     */
    public function copyPreview(int $id): JsonResponse
    {
        try {
            $preview = $this->adminTemplateService->getTemplateCopyPreview($id);

            return response()->json([
                'success' => true,
                'data' => $preview,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '템플릿을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Copy template with optional layer stripping.
     */
    public function copy(AdminTemplateCopyRequest $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validated();
            $clone = $this->adminTemplateService->copyTemplate(
                $id,
                $request->user(),
                (string) $validated['copy_title'],
                (bool) ($validated['copy_layers'] ?? true)
            );

            return response()->json([
                'success' => true,
                'message' => '템플릿이 성공적으로 복사되었습니다.',
                'data' => [
                    'template' => new AdminTemplateResource($clone),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '템플릿을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export templates to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminTemplateExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();

            $history = $this->adminExportHistoryService->executeExcel(
                AdminTemplateExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'templates'
            );

            return response()->json([
                'success' => true,
                'message' => '내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new AdminExportHistory($history),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Check export progress status
     * Excel 다운로드 진행 상태 확인
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

    /**
     * Download exported Excel file
     * Excel 파일 다운로드
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 이력을 찾을 수 없습니다.',
            ], 404);
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 작업이 아직 완료되지 않았습니다.',
            ], 400);
        }

        $disk = Storage::disk(config('filesystems.public_disk'));
        if (! $disk->exists($history->file_path)) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 파일을 찾을 수 없습니다.',
            ], 404);
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
