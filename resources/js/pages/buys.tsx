import { PurchaseCard } from '@/components/purchase-card';
import { UserSidebar } from '@/components/user-sidebar';
import { useEffect, useState } from 'react';

interface Purchase {
    id: string;
    title: string;
    category: string;
    subcategory?: string;
    purchaseDate: string;
    downloadUrl?: string;
    image?: string;
}

export default function BuysPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual Laravel API call
        // const fetchPurchases = async () => {
        //   const response = await fetch('/api/user/purchases')
        //   const data = await response.json()
        //   setPurchases(data)
        //   setIsLoading(false)
        // }
        // fetchPurchases()

        // Mock data for demonstration
        setTimeout(() => {
            setPurchases([
                {
                    id: '1',
                    title: 'RCON SHOP - магазин RCON',
                    category: 'GameCMS',
                    subcategory: 'Модули',
                    purchaseDate: '16.12.2025',
                    downloadUrl: '/downloads/achievements.zip',
                    image: 'https://tpl-market.ru/public/uploads/images/product/screenshots/3vcmJ7SyQWfE.jpg',
                },
            ]);
            setIsLoading(false);
        }, 500);
    }, []);

    return (
        <div className="flex gap-6">
            <div className="w-64 shrink-0">
                <UserSidebar />
            </div>

            <div className="flex-1 space-y-4">
                <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold">Мои покупки</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Все ваши приобретенные товары
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-32 animate-pulse rounded-2xl border bg-card/50 backdrop-blur-sm"
                            />
                        ))}
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="rounded-2xl border bg-card/50 p-12 text-center backdrop-blur-sm">
                        <p className="text-muted-foreground">
                            У вас пока нет покупок
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {purchases.map((purchase) => (
                            <PurchaseCard key={purchase.id} {...purchase} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
