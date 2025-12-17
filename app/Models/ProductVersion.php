<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ProductVersion extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'product_id',
        'version_number',
        'version_name',
        'short_description',
        'full_changelog',
        'download_count',
        'is_latest',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'download_count' => 'integer',
            'is_latest' => 'boolean',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        // When marking a version as latest, unmark all other versions for the product
        static::saving(function ($version) {
            if ($version->is_latest && $version->isDirty('is_latest')) {
                static::where('product_id', $version->product_id)
                    ->where('id', '!=', $version->id)
                    ->update(['is_latest' => false]);
            }
        });
    }

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('product_archives')
            ->useDisk('local')
            ->singleFile();
    }

    /**
     * Get the product that owns the version.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the archive file for the version.
     */
    public function getArchiveFile()
    {
        return $this->getFirstMedia('product_archives');
    }

    /**
     * Increment the download count.
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
        $this->product->incrementDownloadCount();
    }
}
