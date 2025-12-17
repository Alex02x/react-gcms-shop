import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
}

interface PageProps {
    roles: Role[];
}

export default function Index({ roles }: PageProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isSystemRole = (roleName: string) => {
        return ['Admin', 'User'].includes(roleName);
    };

    const handleDelete = (roleId: number) => {
        router.delete(`/admin/roles/${roleId}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    return (
        <AdminLayout title="Role Management">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Roles</h1>
                    <Link href="/admin/roles/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Button>
                    </Link>
                </div>

                {/* Roles Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="rounded-lg border bg-card p-6"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        {role.name}
                                    </h3>
                                    {isSystemRole(role.name) && (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                            System
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span>
                                        {role.permissions_count} permissions
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{role.users_count} users</span>
                                </div>
                                <div className="text-xs">
                                    Created {formatDate(role.created_at)}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Link
                                    href={`/admin/roles/${role.id}/edit`}
                                    className="flex-1"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                {!isSystemRole(role.name) &&
                                    (deleteConfirm === role.id ? (
                                        <div className="flex flex-1 gap-2">
                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    handleDelete(role.id)
                                                }
                                                className="flex-1"
                                            >
                                                Confirm
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setDeleteConfirm(null)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setDeleteConfirm(role.id)
                                            }
                                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
