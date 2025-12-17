import AdminLayout from '@/layouts/admin-layout';
import { Link, router } from '@inertiajs/react';
import { Edit, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    created_at: string;
    roles: Array<{ id: number; name: string }>;
    wallet?: { balance: number };
}

interface Role {
    id: number;
    name: string;
}

interface PageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    roles: Role[];
    filters: Record<string, string>;
}

export default function Index({ users, roles, filters }: PageProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const formatBalance = (balance?: number) => {
        if (!balance) return '₽0.00';
        return `₽${(balance / 100).toFixed(2)}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDelete = (userId: number) => {
        router.delete(`/admin/users/${userId}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    return (
        <AdminLayout title="User Management">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Users</h1>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-card">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                    Roles
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                    Balance
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                    Registered
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-10 w-10 rounded-full"
                                            />
                                            <span className="font-medium">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {user.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {formatBalance(user.wallet?.balance)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/admin/users/${user.id}/wallet`}
                                                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                                            >
                                                <Wallet className="h-4 w-4" />
                                                Wallet
                                            </Link>
                                            {deleteConfirm === user.id ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                user.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirm(
                                                                null,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setDeleteConfirm(
                                                            user.id,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {users.data.length} of {users.total} users
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: users.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Link
                                    key={page}
                                    href={`/admin/users?page=${page}`}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        page === users.current_page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border hover:bg-accent'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
