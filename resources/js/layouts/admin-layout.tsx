import { Link, usePage } from '@inertiajs/react';
import { Folder, LayoutDashboard, Package, Shield, Users } from 'lucide-react';
import { type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
    avatar: string;
    permissions: string[];
    roles: string[];
}

interface PageProps {
    auth: {
        user: AuthUser | null;
        permissions: string[];
        roles: string[];
    };
    [key: string]: unknown;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth } = usePage().props as PageProps;
    const permissions = auth.permissions || [];

    const hasPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    const menuItems = [
        {
            label: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            permission: null,
        },
        {
            label: 'Users',
            href: '/admin/users',
            icon: Users,
            permission: 'manage-users',
        },
        {
            label: 'Roles',
            href: '/admin/roles',
            icon: Shield,
            permission: 'manage-roles',
        },
        {
            label: 'Products',
            href: '/admin/products',
            icon: Package,
            permission: 'edit-products',
        },
        {
            label: 'Categories',
            href: '/admin/categories',
            icon: Folder,
            permission: 'edit-categories',
        },
    ];

    const visibleMenuItems = menuItems.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card">
                <div className="flex h-16 items-center border-b px-6">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="space-y-1 p-4">
                    {visibleMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b bg-card px-6">
                    <div>
                        {title && (
                            <h2 className="text-2xl font-semibold">{title}</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Back to Shop
                        </Link>
                        <div className="flex items-center gap-2">
                            <img
                                src={auth.user?.avatar}
                                alt={auth.user?.name}
                                className="h-8 w-8 rounded-full"
                            />
                            <span className="text-sm font-medium">
                                {auth.user?.name}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
