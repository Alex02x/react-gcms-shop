import { PurchaseCard } from '@/components/purchase-card';
import { UserSidebar } from '@/components/user-sidebar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface Purchase {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        category: string;
        subcategory: string;
        image_url: string | null;
    };
    purchase_price: number;
    formatted_price: string;
    purchased_at: string;
    formatted_date: string;
    can_download: boolean;
}

export default function BuysPage() {
    const { t } = useTranslation('common');
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await axios.get('/user/purchases');
                setPurchases(response.data.data);
            } catch (err: any) {
                console.error('Failed to fetch purchases:', err);
                setError(t('buys.error_loading'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    return (
        <div className="flex gap-6">
            <div className="w-64 shrink-0">
                <UserSidebar />
            </div>

            <div className="flex-1 space-y-4">
                <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold">{t('buys.page_title')}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('buys.page_description')}
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
                ) : error ? (
                    <div className="rounded-2xl border bg-card/50 p-12 text-center backdrop-blur-sm">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="rounded-2xl border bg-card/50 p-12 text-center backdrop-blur-sm">
                        <p className="text-muted-foreground">
                            {t('buys.no_purchases')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {purchases.map((purchase) => (
                            <PurchaseCard
                                key={purchase.id}
                                id={purchase.id}
                                title={purchase.product.name}
                                category={purchase.product.category}
                                subcategory={purchase.product.subcategory}
                                purchaseDate={purchase.formatted_date}
                                image={purchase.product.image_url || undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
