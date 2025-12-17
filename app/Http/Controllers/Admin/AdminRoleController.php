<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminRoleController extends Controller
{
    /**
     * System roles that cannot be deleted or renamed.
     */
    protected array $systemRoles = ['Admin', 'User'];

    /**
     * Display a listing of roles.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Role::class);

        $query = Role::withCount(['users', 'permissions']);

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $roles = $query->get();

        $permissions = Permission::all()->groupBy(function ($permission) {
            // Group permissions by category
            if (str_contains($permission->name, 'user')) {
                return 'User Management';
            } elseif (str_contains($permission->name, 'role')) {
                return 'Role Management';
            } elseif (str_contains($permission->name, 'product') || str_contains($permission->name, 'categor')) {
                return 'Product Management';
            } elseif (str_contains($permission->name, 'item')) {
                return 'Item Distribution';
            } elseif (str_contains($permission->name, 'wallet')) {
                return 'Wallet Operations';
            } else {
                return 'Customer Capabilities';
            }
        });

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create()
    {
        $this->authorize('create', Role::class);

        $permissions = Permission::all()->groupBy(function ($permission) {
            if (str_contains($permission->name, 'user')) {
                return 'User Management';
            } elseif (str_contains($permission->name, 'role')) {
                return 'Role Management';
            } elseif (str_contains($permission->name, 'product') || str_contains($permission->name, 'categor')) {
                return 'Product Management';
            } elseif (str_contains($permission->name, 'item')) {
                return 'Item Distribution';
            } elseif (str_contains($permission->name, 'wallet')) {
                return 'Wallet Operations';
            } else {
                return 'Customer Capabilities';
            }
        });

        return Inertia::render('admin/roles/form', [
            'role' => null,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Role::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        // Clear permission cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->route('admin.roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role)
    {
        $this->authorize('update', $role);

        $role->load('permissions');

        $permissions = Permission::all()->groupBy(function ($permission) {
            if (str_contains($permission->name, 'user')) {
                return 'User Management';
            } elseif (str_contains($permission->name, 'role')) {
                return 'Role Management';
            } elseif (str_contains($permission->name, 'product') || str_contains($permission->name, 'categor')) {
                return 'Product Management';
            } elseif (str_contains($permission->name, 'item')) {
                return 'Item Distribution';
            } elseif (str_contains($permission->name, 'wallet')) {
                return 'Wallet Operations';
            } else {
                return 'Customer Capabilities';
            }
        });

        return Inertia::render('admin/roles/form', [
            'role' => $role,
            'permissions' => $permissions,
            'isSystemRole' => in_array($role->name, $this->systemRoles),
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $isSystemRole = in_array($role->name, $this->systemRoles);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        // Prevent renaming system roles
        if ($isSystemRole && $validated['name'] !== $role->name) {
            return redirect()->back()->withErrors([
                'name' => 'Cannot rename system roles.',
            ]);
        }

        $role->update([
            'name' => $validated['name'],
        ]);

        // Sync permissions
        $role->syncPermissions($validated['permissions'] ?? []);

        // Clear permission cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        // Check if it's a system role
        if (in_array($role->name, $this->systemRoles)) {
            return redirect()->back()->withErrors([
                'role' => 'Cannot delete system roles.',
            ]);
        }

        // Check if role has users
        $usersCount = $role->users()->count();
        if ($usersCount > 0) {
            return redirect()->back()->withErrors([
                'role' => "Cannot delete role. {$usersCount} user(s) are assigned to this role.",
            ]);
        }

        $role->delete();

        // Clear permission cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->route('admin.roles.index')->with('success', 'Role deleted successfully.');
    }
}
