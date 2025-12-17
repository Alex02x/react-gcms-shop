<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Admin permissions
        Permission::create(['name' => 'manage-users', 'guard_name' => 'web']);
        Permission::create(['name' => 'manage-roles', 'guard_name' => 'web']);
        Permission::create(['name' => 'edit-products', 'guard_name' => 'web']);
        Permission::create(['name' => 'edit-categories', 'guard_name' => 'web']);
        Permission::create(['name' => 'grant-items', 'guard_name' => 'web']);
        Permission::create(['name' => 'manage-wallets', 'guard_name' => 'web']);
        Permission::create(['name' => 'manage-reviews', 'guard_name' => 'web']);

        // User permissions
        Permission::create(['name' => 'view-products-categories', 'guard_name' => 'web']);
        Permission::create(['name' => 'purchase-products', 'guard_name' => 'web']);

        // Reset cached permissions again (required if using WithoutModelEvents in seeders)
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
