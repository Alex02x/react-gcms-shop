<?php

namespace App\Policies;

use App\Models\ProductReview;
use App\Models\User;

class ProductReviewPolicy
{
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create reviews
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
