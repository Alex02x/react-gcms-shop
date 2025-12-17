<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MainCategory;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminCategoryController extends Controller
{
    /**
     * Display a listing of main categories.
     */
    public function index(Request $request)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $query = MainCategory::withCount('subcategories');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $categories = $query->with('subcategories')->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created main category.
     */
    public function storeMainCategory(Request $request)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:main_categories',
            'slug' => 'nullable|string|max:255|unique:main_categories|alpha_dash',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = MainCategory::create($validated);

        return redirect()->back()->with('success', 'Main category created successfully.');
    }

    /**
     * Update the specified main category.
     */
    public function updateMainCategory(Request $request, MainCategory $category)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('main_categories')->ignore($category->id)],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('main_categories')->ignore($category->id)],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return redirect()->back()->with('success', 'Main category updated successfully.');
    }

    /**
     * Remove the specified main category.
     */
    public function destroyMainCategory(Request $request, MainCategory $category)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $subcategoriesCount = $category->subcategories()->count();

        if ($subcategoriesCount > 0) {
            return redirect()->back()->withErrors([
                'message' => "Cannot delete category. It has {$subcategoriesCount} subcategories."
            ]);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Main category deleted successfully.');
    }

    /**
     * Store a newly created subcategory.
     */
    public function storeSubcategory(Request $request)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'main_category_id' => 'required|integer|exists:main_categories,id',
            'slug' => 'nullable|string|max:255|alpha_dash',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Check uniqueness within main category
        $exists = Subcategory::where('main_category_id', $validated['main_category_id'])
            ->where('slug', $validated['slug'])
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'slug' => 'This slug already exists in the selected main category.'
            ]);
        }

        $subcategory = Subcategory::create($validated);

        return redirect()->back()->with('success', 'Subcategory created successfully.');
    }

    /**
     * Update the specified subcategory.
     */
    public function updateSubcategory(Request $request, Subcategory $subcategory)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'main_category_id' => 'required|integer|exists:main_categories,id',
            'slug' => 'nullable|string|max:255|alpha_dash',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Check uniqueness within main category
        $exists = Subcategory::where('main_category_id', $validated['main_category_id'])
            ->where('slug', $validated['slug'])
            ->where('id', '!=', $subcategory->id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'slug' => 'This slug already exists in the selected main category.'
            ]);
        }

        $subcategory->update($validated);

        return redirect()->back()->with('success', 'Subcategory updated successfully.');
    }

    /**
     * Remove the specified subcategory.
     */
    public function destroySubcategory(Request $request, Subcategory $subcategory)
    {
        if (!$request->user()->hasPermissionTo('edit-categories')) {
            abort(403, 'Unauthorized action.');
        }

        $productsCount = $subcategory->products()->count();

        if ($productsCount > 0) {
            return redirect()->back()->withErrors([
                'message' => "Cannot delete subcategory. It has {$productsCount} products."
            ]);
        }

        $subcategory->delete();

        return redirect()->back()->with('success', 'Subcategory deleted successfully.');
    }
}
