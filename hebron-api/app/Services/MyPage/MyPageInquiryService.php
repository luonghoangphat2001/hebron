<?php

namespace App\Services\MyPage;

use App\Enums\FileType;
use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Http\Resources\InquiryCommentResource;
use App\Http\Resources\InquiryResource;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\InquiryComment;
use App\Models\User;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageInquiryService
{
    public function __construct(
        protected PaginationService $paginationService,
        protected FileService $fileService,
    ) {}

    /**
     * Get paginated inquiries with filters
     */
    public function getInquiries(User $user, array $filters, int $perPage = 15): array
    {
        try {
            $query = Inquiry::where('user_id', $user->id)
                ->with(['attachments', 'user', 'product'])
                ->latest();

            $query = $this->buildQuery($query, $filters);

            $inquiries = $query->paginate($perPage);

            return [
                'inquiries' => InquiryResource::collection($inquiries->items()),
                'pagination' => $this->paginationService->format($inquiries),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage inquiries failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function buildQuery(Builder $query, array $data): Builder
    {
        if (array_key_exists('status', $data)) {
            $query->where('status', $data['status']);
        }

        if (array_key_exists('category', $data)) {
            $query->where('category', $data['category']);
        }

        if (! empty($data['customer_name'] ?? null)) {
            $customerName = $data['customer_name'];
            $query->whereHas('user', function ($u) use ($customerName) {
                $u->where('company_name', 'like', "%{$customerName}%");
            });
        }

        if (! empty($data['inquirer_name'] ?? null)) {
            $inquirerName = $data['inquirer_name'];
            $query->whereHas('user', function ($u) use ($inquirerName) {
                $u->where('name', 'like', "%{$inquirerName}%");
            });
        }

        if (! empty($data['assigned_to'] ?? null)) {
            $query->where('replied_by', $data['assigned_to']);
        }

        if (array_key_exists('has_attachment', $data) && $data['has_attachment'] !== null && $data['has_attachment'] !== '') {
            if (filter_var($data['has_attachment'], FILTER_VALIDATE_BOOLEAN)) {
                $query->whereHas('attachments');
            } else {
                $query->whereDoesntHave('attachments');
            }
        }

        $search = $data['search_term'] ?? $data['search'] ?? null;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                })
                    ->orWhereHas('repliedBy', function ($r) use ($search) {
                        $r->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if (! empty($data['created_from'] ?? null)) {
            $query->whereDate('inquiries.created_at', '>=', $data['created_from']);
        }
        if (! empty($data['created_to'] ?? null)) {
            $query->whereDate('inquiries.created_at', '<=', $data['created_to']);
        }

        $query->with([
            'user',
            'attachments',
            'repliedBy',
            'comments',
        ]);

        $sortBy = $data['sort_by'] ?? 'created_at';
        $sortOrder = $data['sort_order'] ?? 'desc';

        if ($sortBy === 'customer_name') {
            $query->join('users', 'inquiries.user_id', '=', 'users.id')
                ->select('inquiries.*')
                ->orderBy('users.company_name', $sortOrder);
        } elseif ($sortBy === 'inquiry_type') {
            $query->orderBy('category', $sortOrder);
        } elseif (in_array($sortBy, ['created_at', 'updated_at', 'status'], true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Get inquiry detail with comments and attachments
     *
     * @throws ModelNotFoundException
     */
    public function getInquiryDetail(User $user, int $id): InquiryResource
    {
        try {
            $inquiry = Inquiry::where('user_id', $user->id)
                ->whereKey($id)
                ->with(['commentsNewestFirst' => function ($query) {
                    $query
                        ->with('attachments:id,comment_id,file_name,file_path,file_type,file_size,is_reply_attachment');
                }, 'attachments', 'user', 'product'])
                ->firstOrFail();

            return new InquiryResource($inquiry);
        } catch (\Exception $e) {
            Log::error('Get MyPage inquiry detail failed', [
                'user_id' => $user->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a new inquiry
     *
     * @param  UploadedFile|array|null  $files  Single file, array of files, or null
     */
    public function createInquiry(User $user, array $data): InquiryResource
    {
        try {
            DB::beginTransaction();

            // Create inquiry
            $inquiry = Inquiry::create([
                'user_id' => $user->id,
                'product_id' => $data['product_id'] ?? null,
                'category' => InquiryCategory::from($data['category']),
                'title' => $data['title'],
                'content' => $data['content'],
                'order_number' => $data['order_number'] ?? null,
                'contact' => $data['contact'],
                'status' => InquiryStatus::PENDING,
            ]);

            // Handle file uploads (support both single file and array of files)
            if (array_key_exists('attachments', $data)) {

                foreach ($data['attachments'] ?? [] as $attachment) {
                    if (blank($attachment)) {
                        continue;
                    }

                    $path = $this->resolveAttachmentPath($attachment);

                    InquiryAttachment::create([
                        'inquiry_id' => $inquiry->id,
                        'file_name' => $this->resolveAttachmentName($attachment, $path),
                        'file_path' => $path,
                        'file_type' => is_array($attachment) ? ($attachment['mime_type'] ?? $attachment['file_type'] ?? null) : null,
                        'file_size' => is_array($attachment) ? ($attachment['file_size'] ?? null) : null,
                    ]);
                }
            }

            DB::commit();

            $inquiry->load(['comments', 'attachments', 'user', 'product']);

            return new InquiryResource($inquiry);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create MyPage inquiry failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function updateInquiry(User $user, int $id, array $data): InquiryResource
    {
        try {
            DB::beginTransaction();

            $inquiry = Inquiry::where('user_id', $user->id)->findOrFail($id);

            $updates = [];
            foreach (['product_id', 'title', 'content', 'order_number', 'contact'] as $field) {
                if (array_key_exists($field, $data)) {
                    $updates[$field] = $data[$field];
                }
            }

            if (array_key_exists('category', $data)) {
                $updates['category'] = InquiryCategory::from($data['category']);
            }

            if ($updates !== []) {
                $inquiry->update($updates);
            }

            if (array_key_exists('attachments', $data)) {
                $inquiry->attachments()
                    ->where('is_reply_attachment', false)
                    ->delete();

                foreach ($data['attachments'] ?? [] as $attachment) {
                    if (blank($attachment)) {
                        continue;
                    }

                    $path = $this->resolveAttachmentPath($attachment);

                    InquiryAttachment::create([
                        'inquiry_id' => $inquiry->id,
                        'file_name' => $this->resolveAttachmentName($attachment, $path),
                        'file_path' => $path,
                        'file_type' => is_array($attachment) ? ($attachment['mime_type'] ?? $attachment['file_type'] ?? null) : null,
                        'file_size' => is_array($attachment) ? ($attachment['file_size'] ?? null) : null,
                    ]);
                }
            }

            DB::commit();

            $inquiry->load(['comments', 'attachments', 'user', 'product']);

            return new InquiryResource($inquiry);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update MyPage inquiry failed', [
                'user_id' => $user->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function resolveAttachmentPath(array|string $attachment): string
    {
        $path = is_array($attachment)
            ? ($attachment['file_path'] ?? null)
            : $attachment;

        $urlPath = parse_url($path, PHP_URL_PATH) ?: $path;
        $storagePrefix = '/storage/';

        if (str_contains($urlPath, $storagePrefix)) {
            return ltrim(substr($urlPath, strpos($urlPath, $storagePrefix) + strlen($storagePrefix)), '/');
        }

        return ltrim($urlPath, '/');
    }

    private function resolveAttachmentName(array|string $attachment, string $path): string
    {
        if (is_array($attachment)) {
            return $attachment['name'] ?? $attachment['file_name'] ?? basename($path);
        }

        return basename($path);
    }

    public function deleteInquiry(User $user, int $id): void
    {
        try {
            $inquiry = Inquiry::withTrashed()
                ->where('user_id', $user->id)
                ->findOrFail($id);

            if (! $inquiry->trashed()) {
                $inquiry->delete();
            }
        } catch (\Exception $e) {
            Log::error('Delete MyPage inquiry failed', [
                'user_id' => $user->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Add comment to inquiry
     *
     * @throws ModelNotFoundException
     */
    public function addComment(User $user, int $inquiryId, array $data): InquiryCommentResource
    {
        try {
            // Verify inquiry belongs to user
            $inquiry = Inquiry::where('user_id', $user->id)->findOrFail($inquiryId);

            // Create comment
            $comment = InquiryComment::create([
                'inquiry_id' => $inquiry->id,
                'user_id' => $user->id,
                'author_name' => $data['author_name'] ?? $user->name,
                'content' => $data['content'],
                'is_admin' => false,
            ]);

            $attachments = $data['attachments'] ?? [];

            if ($attachments && ! is_array($attachments)) {
                $attachments = [$attachments];
            }

            DB::transaction(function () use ($attachments, $comment, $inquiry, $user) {
                foreach ($attachments as $attachment) {
                    if ($attachment && $attachment->isValid()) {
                        $path = $attachment->store('inquiry-attachments', config('filesystems.public_disk'));

                        $this->fileService->create(
                            $attachment,
                            $path,
                            FileType::INQUIRY_ATTACHMENTS,
                            $user
                        );

                        InquiryAttachment::create([
                            'inquiry_id' => $inquiry->id,
                            'comment_id' => $comment->id,
                            'file_name' => $attachment->getClientOriginalName(),
                            'file_path' => $path,
                            'file_type' => $attachment->getMimeType(),
                            'file_size' => $attachment->getSize(),
                            'is_reply_attachment' => true,
                        ]);
                    }
                }
            });

            $comment->load('attachments');

            return new InquiryCommentResource($comment);
        } catch (\Exception $e) {
            Log::error('Add inquiry comment failed', [
                'user_id' => $user->id,
                'inquiry_id' => $inquiryId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
