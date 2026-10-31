<?php

namespace App\Services\Admin;

use App\Enums\UsageStatusValue;
use App\Http\Resources\Admin\AdminTemplateResource;
use App\Models\Background;
use App\Models\Template;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminTemplateService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for templates.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'status_options' => UsageStatusValue::options(),
            'specification_search_hint' => 'e.g. 90x50mm, 300gsm, A4 (searches in size, paper, sides)',
        ];
    }

    /**
     * Build query for templates with filters.
     * This method is used by both getTemplates and export.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = Template::query()->with(['product', 'background', 'createdBy']);

        // Filter by template name
        $templateName = Arr::get($filters, 'template_name');
        if ($templateName) {
            $query->where('name', 'like', '%'.$templateName.'%');
        }

        // Filter by linked product
        $linkedProduct = Arr::get($filters, 'linked_product');
        if ($linkedProduct) {
            $query->whereHas('product', function (Builder $builder) use ($linkedProduct) {
                $builder->where('name', 'like', '%'.$linkedProduct.'%')
                    ->orWhere('sku', 'like', '%'.$linkedProduct.'%');
            });
        }

        // Filter by product_id
        $productId = Arr::get($filters, 'product_id');
        if ($productId) {
            $query->where('product_id', $productId);
        }

        // Filter by specification: keyword search in all specification values (size, paper, sides, etc.)
        // User can type e.g. "90x50mm", "300gsm", "A4" without knowing the key name
        $specification = Arr::get($filters, 'specification');
        if ($specification !== null && $specification !== '') {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $specification).'%';
            $specKeys = ['size', 'paper', 'sides']; // keys in specifications JSON to search in
            $query->where(function (Builder $q) use ($like, $specKeys) {
                foreach ($specKeys as $key) {
                    $q->orWhereRaw(
                        'JSON_UNQUOTE(JSON_EXTRACT(specifications, ?)) LIKE ?',
                        ['$.'.$key, $like]
                    );
                }
            });
        }

        // Filter by status (active/inactive)
        $status = Arr::get($filters, 'status');
        if ($status) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by registrant
        $registrant = Arr::get($filters, 'registrant');
        if ($registrant) {
            $query->whereHas('createdBy', function (Builder $builder) use ($registrant) {
                $builder->where('username', 'like', '%'.$registrant.'%')
                    ->orWhere('name', 'like', '%'.$registrant.'%')
                    ->orWhere('email', 'like', '%'.$registrant.'%');
            });
        }

        // Filter by last modified date
        $lastModifiedFrom = Arr::get($filters, 'last_modified_from');
        $lastModifiedTo = Arr::get($filters, 'last_modified_to');
        if ($lastModifiedFrom) {
            $query->where('updated_at', '>=', $lastModifiedFrom);
        }
        if ($lastModifiedTo) {
            $query->where('updated_at', '<=', $lastModifiedTo);
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $allowedSortFields = ['name', 'created_at', 'updated_at', 'is_active'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Get templates with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getTemplates(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single template by ID.
     */
    public function getTemplate(int $id): Template
    {
        return Template::with(['product', 'background', 'createdBy'])->findOrFail($id);
    }

    /**
     * Create a new template.
     *
     * @param  array<string, mixed>  $data
     */
    public function createTemplate(User $adminUser, array $data): Template
    {
        return DB::transaction(function () use ($adminUser, $data) {
            $layoutConfig = $this->normalizeLayoutConfigBackgroundKeysForStorage(Arr::get($data, 'layout_config'));
            $editorSizeIds = Arr::get($data, 'editor_size_ids', []);

            $backgroundId = $this->resolveOrCreateBackground(
                $adminUser,
                Arr::get($data, 'background_id'),
                Arr::get($data, 'background_image_path'),
                $layoutConfig
            );

            $template = Template::create([
                'name' => $data['name'],
                'background_id' => $backgroundId,
                'size_option_id' => Arr::get($data, 'size_option_id'),
                'specifications' => Arr::get($data, 'specifications'),
                'file_path' => Arr::get($data, 'file_path'),
                'safety_line' => Arr::get($data, 'safety_line'),
                'cut_line' => Arr::get($data, 'cut_line'),
                'font_set' => Arr::get($data, 'font_set'),
                'color_set' => Arr::get($data, 'color_set'),
                'spot_color' => Arr::get($data, 'spot_color'),
                // Store JSON fields as-is; FE owns layout_config logic.
                'layout_config' => $layoutConfig,
                'editor_permission' => Arr::get($data, 'editor_permission'),
                'front_preview_url' => Arr::get($data, 'front_preview_url'),
                'back_preview_url' => Arr::get($data, 'back_preview_url'),
                'preview_images' => Arr::get($data, 'preview_images'),
                'is_active' => Arr::get($data, 'is_active', true),
                'created_by' => $adminUser->id,
            ]);

            if (! empty($editorSizeIds) && method_exists($template, 'editorSizes')) {
                $template->editorSizes()->sync($editorSizeIds);
            }

            return $template;
        });
    }

    /**
     * Update an existing template.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateTemplate(int $id, array $data, ?User $adminUser = null): Template
    {
        return DB::transaction(function () use ($id, $data, $adminUser) {
            $template = Template::findOrFail($id);

            $incomingLayoutConfig = Arr::get($data, 'layout_config', $template->layout_config);
            $layoutConfig = $this->normalizeLayoutConfigBackgroundKeysForStorage($incomingLayoutConfig);
            $editorSizeIds = Arr::get($data, 'editor_size_ids');

            $user = $adminUser ?? auth()->user() ?? $template->createdBy;
            $backgroundId = Arr::get($data, 'background_id', $template->background_id);
            $backgroundImagePath = Arr::get($data, 'background_image_path');

            if ($user instanceof User) {
                $backgroundId = $this->resolveOrCreateBackground(
                    $user,
                    Arr::has($data, 'background_id') ? Arr::get($data, 'background_id') : $template->background_id,
                    $backgroundImagePath,
                    $layoutConfig,
                    $template
                );
            }

            $template->update([
                'name' => Arr::get($data, 'name', $template->name),
                'background_id' => $backgroundId,
                'size_option_id' => Arr::get($data, 'size_option_id', $template->size_option_id),
                'specifications' => Arr::get($data, 'specifications', $template->specifications),
                'file_path' => Arr::get($data, 'file_path', $template->file_path),
                'safety_line' => Arr::get($data, 'safety_line', $template->safety_line),
                'cut_line' => Arr::get($data, 'cut_line', $template->cut_line),
                'font_set' => Arr::get($data, 'font_set', $template->font_set),
                'color_set' => Arr::get($data, 'color_set', $template->color_set),
                'spot_color' => Arr::get($data, 'spot_color', $template->spot_color),
                'layout_config' => $layoutConfig,
                'editor_permission' => Arr::get($data, 'editor_permission', $template->editor_permission),
                'front_preview_url' => Arr::get($data, 'front_preview_url', $template->front_preview_url),
                'back_preview_url' => Arr::get($data, 'back_preview_url', $template->back_preview_url),
                'preview_images' => Arr::get($data, 'preview_images', $template->preview_images),
                'is_active' => Arr::get($data, 'is_active', $template->is_active),
            ]);

            if ($editorSizeIds !== null && method_exists($template, 'editorSizes')) {
                $template->editorSizes()->sync($editorSizeIds);
            }

            return $template->load(['product', 'background', 'createdBy']);
        });
    }

    /**
     * Delete a template (soft delete).
     */
    public function deleteTemplate(int $id): void
    {
        DB::transaction(function () use ($id) {
            $template = Template::findOrFail($id);
            $template->delete();
        });
    }

    /**
     * Bulk update templates.
     *
     * @param  array<int>  $templateIds
     * @return array<string, mixed>
     */
    public function bulkUpdate(array $templateIds, string $field, mixed $value): array
    {
        $allowedFields = ['is_active'];
        if (! in_array($field, $allowedFields, true)) {
            throw new \InvalidArgumentException("Field '{$field}' is not allowed for bulk update");
        }

        $updated = Template::query()
            ->whereIn('id', $templateIds)
            ->update([$field => $value]);

        return [
            'updated_count' => $updated,
            'total_count' => count($templateIds),
        ];
    }

    /**
     * Bulk delete templates (soft delete).
     *
     * @param  array<int>  $templateIds
     * @return array<string, mixed>
     */
    public function bulkDelete(array $templateIds): array
    {
        $deleted = Template::query()
            ->whereIn('id', $templateIds)
            ->delete();

        return [
            'deleted_count' => $deleted,
            'total_count' => count($templateIds),
        ];
    }

    public function getTemplateCopyPreview(int $id): array
    {
        $template = Template::query()->findOrFail($id);

        $stem = $this->templateTitleStem((string) $template->name);
        $next = $this->nextTemplateCopySuffixNumber($stem, $template);
        $defaultCopyTitle = $stem.' copy('.$next.')';

        return [
            'template_no' => (int) $template->id,
            'template_id' => (int) $template->id,
            'customer' => '',
            'title' => $template->name,
            'default_copy_title' => $defaultCopyTitle,
            'default_copy_layers' => true,
        ];
    }

    public function copyTemplate(int $id, User $adminUser, string $copyTitle, bool $copyLayers = true): Template
    {
        return DB::transaction(function () use ($id, $adminUser, $copyTitle, $copyLayers) {
            $source = Template::query()->findOrFail($id);

            $clone = $source->replicate();
            $clone->name = mb_substr(trim($copyTitle), 0, 255);
            $clone->created_by = $adminUser->id;

            $layoutConfig = $source->layout_config;
            if (! $copyLayers && is_array($layoutConfig)) {
                $layoutConfig = $this->layoutConfigWithoutLayers($layoutConfig);
            }

            $clone->layout_config = $this->normalizeLayoutConfigBackgroundKeysForStorage(
                is_array($layoutConfig) ? $layoutConfig : null
            );

            $clone->save();

            return $clone->load(['product', 'createdBy']);
        });
    }

    private function templateTitleStem(string $name): string
    {
        $trimmed = trim($name);
        $stem = preg_replace('/\s+copy(?:\(v?\d+\))?$/iu', '', $trimmed);
        $stem = trim((string) $stem);

        return $stem !== '' ? $stem : $trimmed;
    }

    private function nextTemplateCopySuffixNumber(string $stem, Template $source): int
    {
        $regex = '/^'.preg_quote($stem, '/').'\s+copy(?:\(v?(\d+)\))?$/iu';
        $max = 0;

        $this->templatesSharingCopyNamespace($source)
            ->select(['id', 'name'])
            ->chunkById(150, function ($rows) use ($regex, &$max) {
                foreach ($rows as $row) {
                    if (preg_match($regex, (string) $row->name, $matches)) {
                        $n = isset($matches[1]) && $matches[1] !== '' ? (int) $matches[1] : 1;
                        $max = max($max, $n);
                    }
                }
            });

        return $max + 1;
    }

    private function templatesSharingCopyNamespace(Template $source): Builder
    {
        $query = Template::query();

        if ($source->product_id !== null) {
            $query->where('product_id', $source->product_id);
        } else {
            $query->whereNull('product_id');
        }

        return $query;
    }

    private function layoutConfigWithoutLayers(array $layoutConfig): array
    {
        $layoutConfig['layers'] = [];

        return $layoutConfig;
    }

    /**
     * Normalize layout_config.background keys so stored JSON always matches FE shape:
     * front_image_url/back_image_url.
     *
     * @param  array<string, mixed>|null  $layoutConfig
     * @return array<string, mixed>|null
     */
    protected function normalizeLayoutConfigBackgroundKeysForStorage(?array $layoutConfig): ?array
    {
        if ($layoutConfig === null) {
            return null;
        }

        if (! isset($layoutConfig['background']) || ! is_array($layoutConfig['background'])) {
            return $layoutConfig;
        }

        $bg = $layoutConfig['background'];

        // Map legacy front/back to FE keys.
        if (array_key_exists('front', $bg) && ! array_key_exists('front_image_url', $bg)) {
            $bg['front_image_url'] = $bg['front'];
        }
        if (array_key_exists('back', $bg) && ! array_key_exists('back_image_url', $bg)) {
            $bg['back_image_url'] = $bg['back'];
        }

        // Remove legacy keys.
        unset($bg['front'], $bg['back']);

        $layoutConfig['background'] = $bg;

        return $layoutConfig;
    }

    /**
     * Resolve existing background_id or automatically create/register a background record
     * when a new background image is uploaded/used in template create or update.
     */
    public function resolveOrCreateBackground(
        User $adminUser,
        ?int $backgroundId,
        ?string $backgroundImagePath,
        ?array $layoutConfig,
        ?Template $existingTemplate = null
    ): ?int {
        // 1. Explicit background_image_path takes highest priority for registering/using a background
        if ($backgroundImagePath !== null && trim($backgroundImagePath) !== '') {
            $normalized = $this->normalizeImagePath($backgroundImagePath);
            if ($normalized !== null) {
                return $this->findOrCreateBackgroundRecord($adminUser, $normalized)->id;
            }
        }

        // 2. Check front_image_url in layout_config
        $frontImageUrl = Arr::get($layoutConfig, 'background.front_image_url');
        $normalizedFront = $this->normalizeImagePath(is_string($frontImageUrl) ? $frontImageUrl : null);

        // If background_id was provided, check if it matches the current front image
        if ($backgroundId !== null) {
            $currentBg = Background::query()->find($backgroundId);
            if ($currentBg) {
                // If front image is present and different from this background, the user picked a new image in editor
                if ($normalizedFront !== null && $this->normalizeImagePath($currentBg->image_path) !== $normalizedFront) {
                    return $this->findOrCreateBackgroundRecord($adminUser, $normalizedFront)->id;
                }

                return $currentBg->id;
            }
        }

        // 3. If background_id was not provided, but front_image_url is present, automatically register background
        if ($normalizedFront !== null) {
            return $this->findOrCreateBackgroundRecord($adminUser, $normalizedFront)->id;
        }

        return $backgroundId;
    }

    public function findOrCreateBackgroundRecord(User $adminUser, string $normalizedPath): Background
    {
        $existing = Background::query()->where('image_path', $normalizedPath)->first();
        if ($existing) {
            return $existing;
        }

        return Background::create([
            'image_path' => $normalizedPath,
            'created_by' => $adminUser->id,
        ]);
    }

    public function normalizeImagePath(?string $path): ?string
    {
        if ($path === null || trim($path) === '') {
            return null;
        }

        $trimmed = trim($path);

        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return null;
        }

        // If full URL, strip scheme and domain
        if (preg_match('~^https?://[^/]+/(.*)$~i', $trimmed, $matches)) {
            $trimmed = $matches[1];
        }

        // Strip leading storage/ or /storage/
        $trimmed = preg_replace('~^/?storage/~i', '', $trimmed);

        // Strip leading slash
        $trimmed = ltrim($trimmed, '/');

        return $trimmed !== '' ? $trimmed : null;
    }

    /**
     * Format list response with pagination and resources.
     *
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'templates' => AdminTemplateResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }
}
