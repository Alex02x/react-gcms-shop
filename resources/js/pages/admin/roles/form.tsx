import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface PageProps {
    role?: Role;
    permissions: Record<string, Permission[]>;
    isSystemRole?: boolean;
}

export default function Form({ role, permissions, isSystemRole }: PageProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        description: '',
        permissions: role?.permissions.map((p) => p.id) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role) {
            put(`/admin/roles/${role.id}`);
        } else {
            post('/admin/roles');
        }
    };

    const togglePermission = (permissionId: number) => {
        if (data.permissions.includes(permissionId)) {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionId),
            );
        } else {
            setData('permissions', [...data.permissions, permissionId]);
        }
    };

    const toggleCategoryPermissions = (categoryPermissions: Permission[]) => {
        const categoryIds = categoryPermissions.map((p) => p.id);
        const allSelected = categoryIds.every((id) =>
            data.permissions.includes(id),
        );

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((p) => !categoryIds.includes(p)),
            );
        } else {
            setData('permissions', [
                ...data.permissions.filter((p) => !categoryIds.includes(p)),
                ...categoryIds,
            ]);
        }
    };

    return (
        <AdminLayout title={role ? 'Edit Role' : 'Create Role'}>
            <div className="mx-auto max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Role Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    disabled={isSystemRole}
                                    className="mt-1"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                                {isSystemRole && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        System roles cannot be renamed
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Permissions
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(permissions).map(
                                ([category, categoryPermissions]) => (
                                    <div
                                        key={category}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="font-medium">
                                                {category}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    toggleCategoryPermissions(
                                                        categoryPermissions,
                                                    )
                                                }
                                            >
                                                {categoryPermissions.every(
                                                    (p) =>
                                                        data.permissions.includes(
                                                            p.id,
                                                        ),
                                                )
                                                    ? 'Deselect All'
                                                    : 'Select All'}
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {categoryPermissions.map(
                                                (permission) => (
                                                    <label
                                                        key={permission.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.permissions.includes(
                                                                permission.id,
                                                            )}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    permission.id,
                                                                )
                                                            }
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">
                                                            {permission.name}
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {role ? 'Update Role' : 'Create Role'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
