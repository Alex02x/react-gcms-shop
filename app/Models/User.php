<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Bavix\Wallet\Interfaces\Customer;
use Bavix\Wallet\Traits\CanPay;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements Customer
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, CanPay;

    /**
     * The guard name for permissions.
     *
     * @var string
     */
    protected $guard_name = 'web';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'telegram_user_id',
        'telegram_username',
        'telegram_linked_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
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
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'telegram_linked_at' => 'datetime',
        ];
    }

    /**
     * Get the login tokens for the user.
     */
    public function loginTokens(): HasMany
    {
        return $this->hasMany(LoginToken::class);
    }

    /**
     * Generate avatar URL using UI Avatars.
     */
    public function getAvatarAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        $name = $this->name ?? $this->email;
        return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=random';
    }

    /**
     * Get products purchased by this user.
     */
    public function purchasedProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_user')
            ->withPivot(['id', 'purchase_price', 'purchased_at', 'transaction_id'])
            ->withTimestamps()
            ->orderBy('product_user.purchased_at', 'desc');
    }

    /**
     * Check if user has purchased a specific product.
     */
    public function hasPurchased(Product $product): bool
    {
        return $this->purchasedProducts()->where('product_id', $product->id)->exists();
    }

    /**
     * Get the purchase date for a specific product.
     */
    public function getPurchaseDate(Product $product): ?string
    {
        $purchase = $this->purchasedProducts()
            ->where('product_id', $product->id)
            ->first();

        return $purchase?->pivot->purchased_at;
    }

    /**
     * Get the price paid for a specific product.
     */
    public function getPurchasePrice(Product $product): ?float
    {
        $purchase = $this->purchasedProducts()
            ->where('product_id', $product->id)
            ->first();

        return $purchase?->pivot->purchase_price;
    }

    /**
     * Check if user has linked Telegram account.
     */
    public function hasTelegramLinked(): bool
    {
        return !is_null($this->telegram_user_id);
    }
}
