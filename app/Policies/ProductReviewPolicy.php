<?php

namespace App\Policies;

use App\Models\ProductReview;
use App\Models\User;

class ProductReviewPolicy
{
    /**
     * Determine whether the user can create a review for a product.
     */
    public function create(User $user, $product): bool
    {
        // User must have purchased the product to leave a review
        return $product->isPurchasedBy($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProductReview $review): bool
    {
        // User can only update their own review
        return $user->id === $review->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProductReview $review): bool
    {
        // User can delete their own review or admin with manage-reviews permission
        return $user->id === $review->user_id || $user->hasPermissionTo('manage-reviews');
    }
}
