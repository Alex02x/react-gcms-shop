<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('name', 'Admin')->first();
        $userRole = Role::where('name', 'User')->first();

        // Assign admin permissions
        $adminRole->givePermissionTo([
            'manage-users',
            'manage-roles',
            'edit-products',
            'edit-categories',
            'grant-items',
            'manage-wallets',
            'manage-reviews',
        ]);

        // Assign user permissions
        $userRole->givePermissionTo([
            'view-products-categories',
            'purchase-products',
        ]);

        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
