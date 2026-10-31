<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class InquiryComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'inquiry_id',
        'user_id',
        'legacy_article_no',
        'author_name',
        'content',
        'contact_phone',
        'is_admin',
        'legacy_data',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'legacy_data' => 'array',
    ];

    /**
     * Get the inquiry that owns the comment.
     */
    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InquiryAttachment::class, 'comment_id');
    }

    /**
     * Get the user that created the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notificationDeliveries(): MorphMany
    {
        return $this->morphMany(NotificationDelivery::class, 'subject');
    }
}
