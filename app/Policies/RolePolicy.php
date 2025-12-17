<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    /**
     * System roles that cannot be modified.
     */
    protected array $systemRoles = ['Admin', 'User'];

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage-roles');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('manage-roles');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage-roles');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('manage-roles');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Role $role): bool
    {
        // Cannot delete system roles
        if (in_array($role->name, $this->systemRoles)) {
            return false;
        }

        return $user->hasPermissionTo('manage-roles');
    }

    /**
     * Determine whether the role name can be modified.
     */
    public function updateName(User $user, Role $role): bool
    {
        // Cannot rename system roles
        if (in_array($role->name, $this->systemRoles)) {
            return false;
        }

        return $user->hasPermissionTo('manage-roles');
    }
}
