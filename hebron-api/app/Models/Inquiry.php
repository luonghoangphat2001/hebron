<?php

namespace App\Models;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Inquiry extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'product_id',
        'product_type',
        'site_type',
        'quantity_type',
        'budget_type',
        'company_name',
        'deadline',
        'legacy_article_no',
        'category',
        'title',
        'content',
        'order_number',
        'contact',
        'manager_name',
        'email',
        'status',
        'replied_by',
        'reply_contact_phone',
        'reply_content',
        'is_edited_reply',
        'legacy_data', // use for migration
    ];

    protected $casts = [
        'category' => InquiryCategory::class,
        'status' => InquiryStatus::class,
        'legacy_data' => 'array',
        'deadline' => 'date',
    ];

    /**
     * Get the user that owns the inquiry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that this inquiry is about.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the comments for the inquiry.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(InquiryComment::class)->orderByDesc('id')->orderBy('created_at');
    }

    /**
     * Get inquiry comments ordered from newest to oldest.
     */
    public function commentsNewestFirst(): HasMany
    {
        return $this->hasMany(InquiryComment::class)
            ->latest('created_at')
            ->orderByDesc('id');
    }

    /**
     * Get the attachments for the inquiry.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(InquiryAttachment::class);
    }

    /**
     * Get the internal memos for the inquiry.
     */
    public function internalMemos(): HasMany
    {
        return $this->hasMany(InquiryInternalMemo::class)->orderByDesc('created_at');
    }

    public function repliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeOfCategory($query, ?string $category)
    {
        if ($category) {
            return $query->where('category', $category);
        }

        return $query;
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeOfStatus($query, ?string $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }

        return $query;
    }

    /**
     * Scope a query to search by title or content.
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * Scope a query to order by latest first.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Inquiry new (status pending)
     *
     * @return bool
     */
    public function isPending()
    {
        return $this->status === InquiryStatus::PENDING;
    }

    /**
     * Get formatted inquiry number (e.g. INQ-2024-001).
     */
    public function getInquiryNumberAttribute(): ?string
    {
        if (! $this->id || ! $this->created_at) {
            return null;
        }

        $year = $this->created_at->format('Y');
        $seq = str_pad((string) $this->id, 3, '0', STR_PAD_LEFT);

        return "INQ-{$year}-{$seq}";
    }

    /**
     * Configure activity log options for inquiry audit logs.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('inquiry')
            ->logOnly([
                'title',
                'content',
                'order_number',
                'contact',
                'status',
                'replied_by',
                'reply_contact_phone',
                'reply_content',
                'is_edited_reply',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Inquiry has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        // You can extend later to include IP, reason, etc.
    }
}
