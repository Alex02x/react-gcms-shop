import { getCsrfToken, hasPermission } from '@/lib/auth-utils';
import { AuthModal } from '@/components/auth-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PageProps } from '@/types/auth';
import { router, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Shield, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export function ShopHeader() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const permissions = auth.permissions || [];

    const hasAdminPermission = hasPermission(permissions, [
        'manage-users',
        'manage-roles',
        'edit-products',
        'edit-categories',
        'manage-wallets',
    ]);

    const handleLogout = async () => {
        await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        });
        router.reload();
    };

    return (
        <>
            <header className="rounded-2xl border bg-card/50 backdrop-blur-sm">
                <div className="flex h-16 items-center justify-between px-6">
                    <a href="/" className="flex items-center gap-2">
                        <span className="text-xl font-semibold">
                            GameCMS.su
                        </span>
                    </a>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 px-2"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>
                                                {user.email[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">
                                            {user.name ||
                                                user.email.split('@')[0]}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                                        {user.email}
                                    </div>
                                    <DropdownMenuSeparator />
                                    {hasAdminPermission && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <a
                                                    href="/admin/users"
                                                    className="flex cursor-pointer items-center gap-2"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                    Админ панель
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <a
                                            href="/buys"
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                            Мои покупки
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex cursor-pointer items-center gap-2 text-red-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Выйти
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="outline"
                                className="cursor-pointer border-primary/30 bg-transparent transition-all hover:border-primary/50 hover:bg-primary/10"
                                onClick={() => setAuthModalOpen(true)}
                            >
                                Войти
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </>
    );
}
