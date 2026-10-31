<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

final readonly class CommerceIdentity
{
    private function __construct(
        public ?int $userId,
        public ?string $guestTokenHash,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $user = $request->user();
        if ($user instanceof User) {
            return new self($user->id, null);
        }

        return new self(
            null,
            GuestCommerceToken::hash(GuestCommerceToken::fromRequest($request)),
        );
    }

    public static function fromParts(?User $user, ?string $guestToken): self
    {
        return $user
            ? new self($user->id, null)
            : new self(null, GuestCommerceToken::hash($guestToken));
    }

    public function isUser(): bool
    {
        return $this->userId !== null;
    }

    public function scope(Builder $query): Builder
    {
        if ($this->isUser()) {
            return $query->where('user_id', $this->userId);
        }

        return $query->whereNull('user_id')
            ->where('guest_token_hash', $this->guestTokenHash);
    }
}
