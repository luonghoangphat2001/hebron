<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\MemberType;
use App\Enums\UserAuthority;
use App\Enums\UserRegistrationPath;
use App\Enums\UserStatus;
use App\Http\Filters\Admin\UserFilter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use Filterable, HasApiTokens, HasFactory, LogsActivity, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'status',
        'username',
        'name',
        'email',
        'password',
        'phone',
        'mobile',
        'postcode',
        'address',
        'detailed_address',
        'authority',
        'member_type',

        // Bussiness Info
        'business_registration_number',
        'company_name',
        'representative_name',
        'industry_type',
        'business_type',
        'business_postcode',
        'business_address',
        'business_address_detail',
        'tax_invoice_email',
        'homepage_url',
        'business_registration_file',

        'agree_privacy',
        'agree_terms',
        'agree_sms',
        'agree_email',
        'agreed_at',

        'last_login_at',
        'last_login_ip',

        'membership_tier_id',
        'registration_path',
        'metadata',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_type' => MemberType::class,
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'agree_privacy' => 'boolean',
            'agree_terms' => 'boolean',
            'agree_sms' => 'boolean',
            'agree_email' => 'boolean',
            'agreed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'status' => UserStatus::class,
            'registration_path' => UserRegistrationPath::class,
            'metadata' => 'array',
        ];
    }

    protected function getFiltersClass(): string
    {
        return UserFilter::class;
    }

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'username'; // Use username instead of email for authentication
    }

    /**
     * Get the address books for the user.
     */
    public function addressBooks(): HasMany
    {
        return $this->hasMany(AddressBook::class);
    }

    /**
     * Get the refund histories for the user.
     */
    public function refundHistories(): HasMany
    {
        return $this->hasMany(RefundHistory::class);
    }

    /**
     * Get the refresh tokens for the user.
     */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Get the orders for the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get admin permissions assigned to this user.
     */
    public function adminPermissions(): HasMany
    {
        return $this->hasMany(UserAdminPermission::class);
    }

    public function permissions(): HasManyThrough
    {
        return $this->hasManyThrough(
            AdminPermission::class,
            UserAdminPermission::class,
            'user_id',
            'id',
            'id',
            'admin_permission_id'
        );
    }

    public function activePermissions()
    {
        return $this->permissions()
            ->where('usage_status', 'ACTIVE');
    }

    /**
     * Get recently viewed products for this user.
     */
    public function recentlyViewedProducts(): HasMany
    {
        return $this->hasMany(RecentlyViewedProduct::class);
    }

    /**
     * Get reviews written by this user.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function membershipTier(): BelongsTo
    {
        return $this->belongsTo(MembershipTier::class, 'membership_tier_id');
    }

    /**
     * Get authority enum
     */
    public function getAuthorityEnum(): ?UserAuthority
    {
        return UserAuthority::tryFromString($this->authority);
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        $enum = $this->getAuthorityEnum();

        return $enum?->isSuperAdmin() ?? false;
    }

    /**
     * Check if user is any admin type
     */
    public function isAdmin(): bool
    {
        $enum = $this->getAuthorityEnum();

        return $enum?->isAdmin() ?? false;
    }

    public function isStoreAdmin(): bool
    {
        return $this->authority === UserAuthority::STORE_ADMIN->value;
    }

    /**
     * Check if user is normal user
     */
    public function isUser(): bool
    {
        $enum = $this->getAuthorityEnum();

        return $enum === UserAuthority::USER;
    }

    public function isActive(): bool
    {
        return $this->status?->isActive() ?? false;
    }

    protected static function booted()
    {
        /**
         * Default active status when creating
         */
        static::creating(function ($user) {
            $user->status ??= UserStatus::ACTIVE;
        });
    }

    /**
     * Configure activity log options for User model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'email',
                'phone',
                'mobile',
                'postcode',
                'address',
                'detailed_address',
                'status',
                'authority',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Member has been {$eventName}");
    }
}
