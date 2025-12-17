<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminProductVersionController extends Controller
{
    /**
     * Display a listing of versions for a product.
     */
    public function index(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $versions = $product->versions()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/products/versions/index', [
            'product' => $product,
            'versions' => $versions,
        ]);
    }

    /**
     * Show the form for creating a new version.
     */
    public function create(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('admin/products/versions/create', [
            'product' => $product,
        ]);
    }

    /**
     * Store a newly created version.
     */
    public function store(Request $request, Product $product)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'version_number' => 'required|string|max:50',
            'version_name' => 'required|string|max:255',
            'short_description' => 'required|string|max:1000',
            'full_changelog' => 'required|string',
            'is_latest' => 'boolean',
            'archive_file' => 'required|file|max:512000|mimes:zip,rar,tar,gz',
        ]);

        $version = new ProductVersion($validated);
        $version->product_id = $product->id;
        $version->save();

        // Handle archive file upload to private storage
        if ($request->hasFile('archive_file')) {
            $version->addMedia($request->file('archive_file'))
                ->toMediaCollection('product_archives', 'local');
        }

        return redirect()->route('admin.products.versions.index', $product)
            ->with('success', 'Version created successfully.');
    }

    /**
     * Show the form for editing the specified version.
     */
    public function edit(Request $request, Product $product, ProductVersion $version)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        if ($version->product_id !== $product->id) {
            abort(404);
        }

        $version->load('media');

        return Inertia::render('admin/products/versions/edit', [
            'product' => $product,
            'version' => $version,
        ]);
    }

    /**
     * Update the specified version.
     */
    public function update(Request $request, Product $product, ProductVersion $version)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        if ($version->product_id !== $product->id) {
            abort(404);
        }

        $validated = $request->validate([
            'version_number' => 'required|string|max:50',
            'version_name' => 'required|string|max:255',
            'short_description' => 'required|string|max:1000',
            'full_changelog' => 'required|string',
            'is_latest' => 'boolean',
        ]);

        $version->update($validated);

        return redirect()->back()->with('success', 'Version updated successfully.');
    }

    /**
     * Upload new archive file for version.
     */
    public function uploadArchive(Request $request, Product $product, ProductVersion $version)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        if ($version->product_id !== $product->id) {
            abort(404);
        }

        $request->validate([
            'archive_file' => 'required|file|max:512000|mimes:zip,rar,tar,gz',
        ]);

        // Delete old archive if exists
        $version->clearMediaCollection('product_archives');

        // Upload new archive to private storage
        $version->addMedia($request->file('archive_file'))
            ->toMediaCollection('product_archives', 'local');

        return redirect()->back()->with('success', 'Archive file updated successfully.');
    }

    /**
     * Toggle is_latest flag for version.
     */
    public function toggleLatest(Request $request, Product $product, ProductVersion $version)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        if ($version->product_id !== $product->id) {
            abort(404);
        }

        // If setting to latest, unmark all other versions
        if (!$version->is_latest) {
            ProductVersion::where('product_id', $product->id)
                ->where('id', '!=', $version->id)
                ->update(['is_latest' => false]);

            $version->update(['is_latest' => true]);
            $message = 'Version marked as latest.';
        } else {
            $version->update(['is_latest' => false]);
            $message = 'Version unmarked as latest.';
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Remove the specified version.
     */
    public function destroy(Request $request, Product $product, ProductVersion $version)
    {
        if (!$request->user()->hasPermissionTo('edit-products')) {
            abort(403, 'Unauthorized action.');
        }

        if ($version->product_id !== $product->id) {
            abort(404);
        }

        $version->delete();

        return redirect()->route('admin.products.versions.index', $product)
            ->with('success', 'Version deleted successfully.');
    }
}
