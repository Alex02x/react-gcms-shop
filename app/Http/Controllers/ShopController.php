<?php

namespace App\Http\Controllers;

use App\Models\MainCategory;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShopController extends Controller
{
    /**
     * Display the main shop page with products and categories.
     */
    public function index(Request $request)
    {
        // Get all main categories with their subcategories
        $categories = MainCategory::with('subcategories')->get();

        // Build product query
        $query = Product::with(['subcategory.mainCategory', 'media'])
            ->withCount('reviews');

        // Filter by subcategory if provided
        if ($request->filled('subcategory')) {
            $subcategory = Subcategory::where('slug', $request->subcategory)->first();
            if ($subcategory) {
                $query->where('subcategory_id', $subcategory->id);
            }
        }

        // Filter by main category if provided
        if ($request->filled('category') && !$request->filled('subcategory')) {
            $mainCategory = MainCategory::where('slug', $request->category)->first();
            if ($mainCategory) {
                $subcategoryIds = $mainCategory->subcategories->pluck('id');
                $query->whereIn('subcategory_id', $subcategoryIds);
            }
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Get products with pagination
        $products = $query->latest()
            ->paginate(12)
            ->through(function ($product) {
                // Get first image
                $firstImage = $product->getFirstMedia('product_images');

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'short_description' => $product->short_description,
                    'current_price' => $product->current_price,
                    'original_price' => $product->original_price,
                    'author' => $product->author,
                    'view_count' => $product->view_count,
                    'download_count' => $product->download_count,
                    'reviews_count' => $product->reviews_count,
                    'average_rating' => $product->averageRating(),
                    'has_discount' => $product->hasDiscount(),
                    'image' => $firstImage ? $firstImage->getUrl() : null,
                    'category' => [
                        'name' => $product->subcategory->mainCategory->name,
                        'slug' => $product->subcategory->mainCategory->slug,
                    ],
                    'subcategory' => [
                        'name' => $product->subcategory->name,
                        'slug' => $product->subcategory->slug,
                    ],
                ];
            });

        return Inertia::render('index', [
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'subcategories' => $category->subcategories->map(function ($sub) {
                        return [
                            'id' => $sub->id,
                            'name' => $sub->name,
                            'slug' => $sub->slug,
                        ];
                    }),
                ];
            }),
            'products' => $products,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'subcategory' => $request->subcategory,
            ],
        ]);
    }

    /**
     * Display the product detail page.
     */
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->with([
                'subcategory.mainCategory',
                'media',
                'versions' => function ($query) {
                    $query->latest()->take(3);
                },
                'reviews' => function ($query) {
                    $query->with('user')->latest();
                },
            ])
            ->firstOrFail();

        // Increment view count
        $product->incrementViewCount();

        // Get all images
        $images = $product->getMedia('product_images')->map(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'name' => $media->file_name,
            ];
        });

        // Get latest version
        $latestVersion = $product->versions()->where('is_latest', true)->first();

        // Check if user has purchased this product
        $isPurchased = Auth::check() ? Auth::user()->hasPurchased($product) : false;

        return Inertia::render('product', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'short_description' => $product->short_description,
                'long_description' => $product->long_description,
                'current_price' => $product->current_price,
                'original_price' => $product->original_price,
                'author' => $product->author,
                'demo_url' => $product->demo_url,
                'view_count' => $product->view_count,
                'download_count' => $product->download_count,
                'created_at' => $product->created_at->format('Y-m-d'),
                'has_discount' => $product->hasDiscount(),
                'is_purchased' => $isPurchased,
                'prevent_repurchase' => $product->prevent_repurchase,
                'images' => $images,
                'category' => [
                    'name' => $product->subcategory->mainCategory->name,
                    'slug' => $product->subcategory->mainCategory->slug,
                ],
                'subcategory' => [
                    'name' => $product->subcategory->name,
                    'slug' => $product->subcategory->slug,
                ],
                'latest_version' => $latestVersion ? [
                    'id' => $latestVersion->id,
                    'version_number' => $latestVersion->version_number,
                    'version_name' => $latestVersion->version_name,
                    'created_at' => $latestVersion->created_at->format('Y-m-d'),
                ] : null,
                'versions' => $product->versions->map(function ($version) {
                    return [
                        'id' => $version->id,
                        'version_number' => $version->version_number,
                        'version_name' => $version->version_name,
                        'short_description' => $version->short_description,
                        'full_changelog' => $version->full_changelog,
                        'download_count' => $version->download_count,
                        'is_latest' => $version->is_latest,
                        'created_at' => $version->created_at->format('Y-m-d'),
                    ];
                }),
                'reviews' => $product->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'review_text' => $review->review_text,
                        'created_at' => $review->created_at->format('Y-m-d'),
                        'user' => [
                            'id' => $review->user->id,
                            'name' => $review->user->name,
                            'avatar' => $review->user->avatar,
                        ],
                    ];
                }),
                'average_rating' => $product->averageRating(),
                'reviews_count' => $product->reviews->count(),
            ],
        ]);
    }
}
