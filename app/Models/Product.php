<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'subcategory_id',
        'short_description',
        'long_description',
        'current_price',
        'original_price',
        'author',
        'demo_url',
        'view_count',
        'download_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'view_count' => 'integer',
            'download_count' => 'integer',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Register media collections.
     * 
     * Note: Image conversions are disabled due to PHP GD lacking JPEG/PNG support.
     * Original images will be stored and served without conversions.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('product_images')
            ->useDisk('public');
            // Image conversions disabled - PHP GD has no JPEG/PNG support
    }

    /**
     * Get the subcategory that owns the product.
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the versions for the product.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ProductVersion::class);
    }

    /**
     * Get the latest version for the product.
     */
    public function latestVersion(): HasMany
    {
        return $this->hasMany(ProductVersion::class)->where('is_latest', true);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Get the average rating for the product.
     */
    public function averageRating(): float
    {
        return (float) $this->reviews()->avg('rating') ?? 0.0;
    }

    /**
     * Check if the product has a discount.
     */
    public function hasDiscount(): bool
    {
        return $this->original_price !== null && $this->original_price > $this->current_price;
    }

    /**
     * Increment the view count.
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Increment the download count.
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }
}
