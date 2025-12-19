<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $query = Product::with(['subcategory.mainCategory']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('slug', 'like', "%{$request->search}%")
                    ->orWhere('author', 'like', "%{$request->search}%")
                    ->orWhere('short_description', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('subcategory_id')) {
            $query->where('subcategory_id', $request->subcategory_id);
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $subcategories = Subcategory::with('mainCategory')->get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'subcategories' => $subcategories,
            'filters' => $request->only(['search', 'subcategory_id']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $subcategories = Subcategory::with('mainCategory')->get();

        return Inertia::render('admin/products/create', [
            'subcategories' => $subcategories,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products|alpha_dash',
            'subcategory_id' => 'required|integer|exists:subcategories,id',
            'short_description' => 'required|string|max:1000',
            'long_description' => 'required|string',
            'current_price' => 'required|numeric|min:0|max:9999999.99',
            'original_price' => 'nullable|numeric|min:0|max:9999999.99|gt:current_price',
            'author' => 'required|string|max:255',
            'demo_url' => 'nullable|url|max:2048',
            'images' => 'nullable|array|max:20',
            'images.*' => 'image|max:102400|mimes:jpeg,jpg,png,gif', // 100MB
            'prevent_repurchase' => 'nullable|boolean',
            'require_telegram_subscription' => 'nullable|boolean',
        ]);

        // If current_price is not 0, force require_telegram_subscription to false
        if ($validated['current_price'] > 0) {
            $validated['require_telegram_subscription'] = false;
        }

        $product = Product::create($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $product->addMedia($image)
                    ->withCustomProperties(['order' => $index])
                    ->toMediaCollection('product_images');
            }
        }

        return redirect()->route('admin.products.edit', $product)
            ->with('success', 'Product created successfully.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $product->load(['subcategory.mainCategory', 'media']);

        $subcategories = Subcategory::with('mainCategory')->get();

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'subcategories' => $subcategories,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('products')->ignore($product->id)],
            'subcategory_id' => 'required|integer|exists:subcategories,id',
            'short_description' => 'required|string|max:1000',
            'long_description' => 'required|string',
            'current_price' => 'required|numeric|min:0|max:9999999.99',
            'original_price' => 'nullable|numeric|min:0|max:9999999.99|gt:current_price',
            'author' => 'required|string|max:255',
            'demo_url' => 'nullable|url|max:2048',
            'prevent_repurchase' => 'nullable|boolean',
            'require_telegram_subscription' => 'nullable|boolean',
        ]);

        // If current_price is not 0, force require_telegram_subscription to false
        if ($validated['current_price'] > 0) {
            $validated['require_telegram_subscription'] = false;
        }

        $product->update($validated);

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    /**
     * Upload product images.
     */
    public function uploadImages(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $currentImagesCount = $product->getMedia('product_images')->count();
        $maxAllowed = 20 - $currentImagesCount;

        $request->validate([
            'images' => "required|array|max:{$maxAllowed}",
            'images.*' => 'image|max:102400|mimes:jpeg,jpg,png,gif', // 100MB
        ]);

        foreach ($request->file('images') as $index => $image) {
            $product->addMedia($image)
                ->withCustomProperties(['order' => $currentImagesCount + $index])
                ->toMediaCollection('product_images');
        }

        return redirect()->back()->with('success', 'Images uploaded successfully.');
    }

    /**
     * Delete product image.
     */
    public function deleteImage(Request $request, Product $product, $mediaId)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $media = $product->getMedia('product_images')->find($mediaId);

        if ($media) {
            $media->delete();
            return redirect()->back()->with('success', 'Image deleted successfully.');
        }

        return redirect()->back()->withErrors(['message' => 'Image not found.']);
    }

    /**
     * Reorder product images.
     */
    public function reorderImages(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:media,id',
        ]);

        foreach ($validated['order'] as $index => $mediaId) {
            $media = $product->getMedia('product_images')->find($mediaId);
            if ($media) {
                $media->setCustomProperty('order', $index);
                $media->save();
            }
        }

        return redirect()->back()->with('success', 'Images reordered successfully.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
