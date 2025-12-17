import { CreditCard, Settings, ShoppingBag } from 'lucide-react';

const menuItems = [
    {
        title: 'Мои покупки',
        href: '/buys',
        icon: ShoppingBag,
    },
    {
        title: 'Мой кошелек',
        href: '/wallet',
        icon: CreditCard,
    },
    {
        title: 'Настройки профиля',
        href: '/settings',
        icon: Settings,
    },
];

export function UserSidebar() {
    const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <aside className="w-full space-y-2 rounded-2xl border bg-card/50 p-4 backdrop-blur-sm">
            <h2 className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                Личный кабинет
            </h2>
            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                isActive
                                    ? 'border border-primary/30 bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.title}
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}
