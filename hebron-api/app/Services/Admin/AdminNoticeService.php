<?php

namespace App\Services\Admin;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Models\Customer;
use App\Models\Notice;
use App\Models\PostCategory;
use App\Models\User;
use App\Services\PaginationService;
use App\Services\PostCategoryService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminNoticeService
{
    public function __construct(
        protected PaginationService $paginationService,
        protected PostCategoryService $postCategories,
    ) {}

    /**
     * Get search filter options for notices.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        // Get authors from notices (users who created notices)
        $authors = User::query()
            ->whereIn('id', function ($query) {
                $query->select('created_by')
                    ->from('notices')
                    ->whereNotNull('created_by')
                    ->distinct();
            })
            ->select('id', 'username', 'name')
            ->orderBy('name')
            ->orderBy('username')
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => $user->name ?? $user->username ?? ('User #'.$user->id),
            ])
            ->all();

        return [
            'exposure_status_options' => [
                ['value' => 'exposed', 'label' => 'Exposed'],
                ['value' => 'non-exposed', 'label' => 'Non-Exposed'],
            ],
            'exposure_location_options' => [
                ['value' => 'main', 'label' => 'Main'],
                ['value' => 'login', 'label' => 'Login'],
                ['value' => 'dashboard', 'label' => 'Dashboard'],
            ],
            'author_options' => $authors,
        ];
    }

    /**
     * Get notices with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getNotices(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Notice::query()->with('createdBy', 'categories');

        if ($siteType = Arr::get($filters, 'site_type')) {
            $query->where('site_type', $siteType);
        }

        // Title search (FE: title)
        $title = Arr::get($filters, 'title');
        if ($title !== null && $title !== '') {
            $query->where('title', 'like', '%'.$title.'%');
        }

        // Search term (title or content) - backward compat, merged search box
        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm) {
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'like', '%'.$searchTerm.'%')
                    ->orWhere('content', 'like', '%'.$searchTerm.'%');
            });
        }

        // Filter by author (created_by)
        $authorId = Arr::get($filters, 'author_id');
        if ($authorId) {
            $query->where('created_by', $authorId);
        }

        // Filter by registrant (created_by) - FE: registrant_id
        $registrantId = Arr::get($filters, 'registrant_id');
        if ($registrantId) {
            $query->where('created_by', $registrantId);
        }

        // Filter by exposure location
        $exposureLocation = Arr::get($filters, 'exposure_location');
        if ($exposureLocation) {
            $query->where('exposure_location', $exposureLocation);
        }

        // Filter by exposure status (exposed/non-exposed)
        $exposureStatus = Arr::get($filters, 'exposure_status');
        if ($exposureStatus) {
            if ($exposureStatus === 'exposed') {
                $query->where('is_active', true)
                    ->where(function (Builder $q) {
                        $q->whereNull('published_at')
                            ->orWhere('published_at', '<=', now());
                    })
                    ->where(function (Builder $q) {
                        $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>=', now());
                    });
            } else {
                $query->where(function (Builder $q) {
                    $q->where('is_active', false)
                        ->orWhere(function (Builder $q2) {
                            $q2->whereNotNull('published_at')
                                ->where('published_at', '>', now());
                        })
                        ->orWhere(function (Builder $q2) {
                            $q2->whereNotNull('expires_at')
                                ->where('expires_at', '<', now());
                        });
                });
            }
        }

        // Exposure period: Notice uses published_at / expires_at (FE: exposure_start_date, exposure_end_date)
        $exposureStartDate = Arr::get($filters, 'exposure_start_date');
        if ($exposureStartDate) {
            $query->whereDate('published_at', '>=', $exposureStartDate);
        }
        $exposureEndDate = Arr::get($filters, 'exposure_end_date');
        if ($exposureEndDate) {
            $query->where(function (Builder $q) use ($exposureEndDate) {
                $q->whereNull('expires_at')
                    ->orWhereDate('expires_at', '<=', $exposureEndDate);
            });
        }

        $categoryId = Arr::get($filters, 'category_id');
        if ($categoryId) {
            $query->whereHas('categories', function (Builder $q) use ($categoryId) {
                $q->where('post_categories.id', $categoryId);
            });
        }

        // Sort (FE: sort_by = NOTICE_SORT_BY, sort_order)
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        // Map sort_by to actual column
        $sortColumn = match ($sortBy) {
            'title' => 'title',
            'author' => 'created_by',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            default => 'created_at',
        };

        $query->orderBy('is_pinned', 'desc')
            ->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single notice detail.
     */
    public function getNotice(int $id): Notice
    {
        return Notice::with('createdBy')->findOrFail($id);
    }

    /**
     * Create a new notice.
     *
     * @param  array<string, mixed>  $data
     */
    public function createNotice(User $adminUser, array $data): Notice
    {
        return DB::transaction(function () use ($adminUser, $data) {
            // Normalize exposure_target: 'all' or array of customer IDs
            $exposureTarget = $data['exposure_target'] ?? 'all';

            if ($exposureTarget === null || $exposureTarget === '' || (is_array($exposureTarget) && count($exposureTarget) === 0)) {
                $exposureTarget = 'all';
            }

            $categoryId = $data['category_id'] ?? null;
            $notice = Notice::create([
                'title' => $data['title'],
                'site_type' => $data['site_type'] ?? SiteType::SHOPPING_MALL->value,
                'content' => $data['content'],
                'type' => $data['type'] ?? 'general',
                'attachments' => $data['attachments'] ?? null,
                'is_pinned' => $data['is_pinned'] ?? false,
                'is_active' => $data['exposure_status'] === 'exposed',
                'published_at' => $data['exposure_start_date'] ?? null,
                'expires_at' => $data['exposure_end_date'] ?? null,
                'exposure_target' => $exposureTarget === 'all' ? 'all' : (array) $exposureTarget,
                'exposure_location' => $data['exposure_location'],
                'created_by' => $adminUser->id,
            ]);

            if ($categoryId !== null) {
                $this->postCategories->assign(
                    PostCategoryPageType::NOTICE->value,
                    $notice->id,
                    PostCategory::query()->findOrFail($categoryId),
                );
            }

            return $notice->fresh(['createdBy', 'categories']);
        });
    }

    /**
     * Update an existing notice.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateNotice(int $id, array $data): Notice
    {
        return DB::transaction(function () use ($id, $data) {
            $notice = Notice::findOrFail($id);
            $hasCategory = array_key_exists('category_id', $data);
            $categoryId = $data['category_id'] ?? null;
            unset($data['category_id']);

            $updateData = [];

            if (isset($data['title'])) {
                $updateData['title'] = $data['title'];
            }
            if (isset($data['content'])) {
                $updateData['content'] = $data['content'];
            }
            if (isset($data['type'])) {
                $updateData['type'] = $data['type'];
            }
            if (isset($data['site_type'])) {
                $updateData['site_type'] = $data['site_type'];
            }
            if (isset($data['attachments'])) {
                $updateData['attachments'] = $data['attachments'];
            }
            if (isset($data['is_pinned'])) {
                $updateData['is_pinned'] = $data['is_pinned'];
            }
            if (isset($data['exposure_status'])) {
                $updateData['is_active'] = $data['exposure_status'] === 'exposed';
            }
            if (isset($data['exposure_start_date'])) {
                $updateData['published_at'] = $data['exposure_start_date'];
            }
            if (isset($data['exposure_end_date'])) {
                $updateData['expires_at'] = $data['exposure_end_date'];
            }
            if (isset($data['exposure_target'])) {
                $updateData['exposure_target'] = $data['exposure_target'];
            }
            if (isset($data['exposure_location'])) {
                $updateData['exposure_location'] = $data['exposure_location'];
            }

            $notice->update($updateData);

            if ($hasCategory) {
                if ($categoryId === null) {
                    $this->postCategories->detach(PostCategoryPageType::NOTICE->value, $notice->id);
                } else {
                    $this->postCategories->assign(
                        PostCategoryPageType::NOTICE->value,
                        $notice->id,
                        PostCategory::query()->findOrFail($categoryId),
                    );
                }
            }

            return $notice->fresh(['createdBy', 'categories']);
        });
    }

    /**
     * Delete a notice.
     */
    public function deleteNotice(int $id): void
    {
        DB::transaction(function () use ($id) {
            $notice = Notice::findOrFail($id);
            $notice->delete(); // soft delete
        });
    }
}
