<?php

namespace App\Policies;

use App\Models\MainCategory;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-products-categories');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MainCategory $category): bool
    {
        return $user->hasPermissionTo('view-products-categories');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('edit-categories');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MainCategory $category): bool
    {
        return $user->hasPermissionTo('edit-categories');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MainCategory $category): bool
    {
        return $user->hasPermissionTo('edit-categories');
    }
}
