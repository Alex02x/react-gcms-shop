<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Get all reviews for a product (paginated).
     */
    public function index(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $perPage = min($request->input('per_page', 10), 50);
        $sort = $request->input('sort', 'recent');

        $query = ProductReview::where('product_id', $product->id)
            ->with('user');

        // Apply sorting
        switch ($sort) {
            case 'highest_rating':
                $query->orderBy('rating', 'desc')->orderBy('created_at', 'desc');
                break;
            case 'lowest_rating':
                $query->orderBy('rating', 'asc')->orderBy('created_at', 'desc');
                break;
            case 'recent':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $reviews = $query->paginate($perPage);

        $user = Auth::user();

        $data = $reviews->map(function ($review) use ($user) {
            return [
                'id' => $review->id,
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->name,
                    'avatar_url' => $review->user->avatar,
                ],
                'rating' => $review->rating,
                'review_text' => $review->review_text,
                'created_at' => $review->created_at->toISOString(),
                'updated_at' => $review->updated_at->toISOString(),
                'can_edit' => $user && $user->can('update', $review),
                'can_delete' => $user && $user->can('delete', $review),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Submit a new review for a product.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $user = Auth::user();
        $product = Product::where('slug', $slug)->firstOrFail();

        // Check if user can create a review (must have purchased the product)
        if (!Gate::forUser($user)->allows('create', [ProductReview::class, $product])) {
            return response()->json([
                'success' => false,
                'message' => 'You must purchase this product before leaving a review.',
            ], 403);
        }

        // Check if user has already reviewed this product
        $existingReview = ProductReview::where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this product. You can edit your existing review.',
            ], 400);
        }

        // Validate input
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'required|string|min:10|max:2000',
        ]);

        try {
            DB::beginTransaction();

            // Create the review
            $review = ProductReview::create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'rating' => $validated['rating'],
                'review_text' => $validated['review_text'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'review' => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'review_text' => $review->review_text,
                    'created_at' => $review->created_at->toISOString(),
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar_url' => $user->avatar,
                    ],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Review submission failed', [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your review. Please try again.',
            ], 500);
        }
    }

    /**
     * Update a review.
     */
    public function update(Request $request, ProductReview $review): JsonResponse
    {
        $user = Auth::user();

        // Check if user can update this review
        if (!Gate::forUser($user)->allows('update', $review)) {
            return response()->json([
                'success' => false,
                'message' => 'You can only edit your own reviews.',
            ], 403);
        }

        // Validate input (at least one field must be provided)
        $validated = $request->validate([
            'rating' => 'nullable|integer|min:1|max:5',
            'review_text' => 'nullable|string|min:10|max:2000',
        ]);

        // Ensure at least one field is provided
        if (!isset($validated['rating']) && !isset($validated['review_text'])) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide at least one field to update.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update the review
            if (isset($validated['rating'])) {
                $review->rating = $validated['rating'];
            }
            if (isset($validated['review_text'])) {
                $review->review_text = $validated['review_text'];
            }
            $review->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully',
                'review' => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'review_text' => $review->review_text,
                    'updated_at' => $review->updated_at->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Review update failed', [
                'review_id' => $review->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating your review. Please try again.',
            ], 500);
        }
    }

    /**
     * Delete a review.
     */
    public function destroy(ProductReview $review): JsonResponse
    {
        $user = Auth::user();

        // Check if user can delete this review
        if (!Gate::forUser($user)->allows('delete', $review)) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own reviews.',
            ], 403);
        }

        try {
            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Review deletion failed', [
                'review_id' => $review->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting your review. Please try again.',
            ], 500);
        }
    }
}
