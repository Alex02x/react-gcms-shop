import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Package, Star, User } from 'lucide-react';
import { ProductVersionHistory } from '@/components/product-version-history';
import { usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types/auth';
import { AuthModal } from '@/components/auth-modal';
import { PurchaseConfirmationModal } from '@/components/purchase-confirmation-modal';
import { InsufficientBalanceModal } from '@/components/insufficient-balance-modal';
import axios from 'axios';

interface ProductSidebarProps {
    author: string;
    category: string;
    subcategory?: string;
    createdAt: string;
    downloads: number;
    version: string;
    rating: number;
    reviewsCount: number;
    price: number;
    originalPrice?: number;
    demoUrl?: string;
    productId: number;
    productSlug: string;
    isPurchased?: boolean;
    preventRepurchase?: boolean;
    versions?: Array<{
        version_number: string;
        version_name: string;
        download_count: number;
        is_latest: boolean;
        created_at: string;
    }>;
}

export function ProductSidebar({
    author,
    category,
    subcategory,
    createdAt,
    downloads,
    version,
    rating,
    reviewsCount,
    price,
    originalPrice,
    demoUrl,
    productId,
    productSlug,
    isPurchased = false,
    preventRepurchase = false,
    versions,
}: ProductSidebarProps) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [insufficientBalanceModalOpen, setInsufficientBalanceModalOpen] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string>();
    const [purchaseData, setPurchaseData] = useState<any>(null);
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const handleBuyNow = async () => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }

        setIsPurchasing(true);
        setPurchaseError(undefined);

        try {
            const response = await axios.post(
                `/products/${productSlug}/purchase/initiate`
            );

            const data = response.data;
            setPurchaseData(data);

            if (data.can_purchase) {
                setConfirmationModalOpen(true);
            } else {
                setInsufficientBalanceModalOpen(true);
            }
        } catch (error: any) {
            console.error('Purchase initiation failed:', error);
            setPurchaseError(
                error.response?.data?.message ||
                    'Failed to initiate purchase. Please try again.'
            );
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleConfirmPurchase = async () => {
        setIsProcessing(true);
        setPurchaseError(undefined);

        try {
            const response = await axios.post(
                `/products/${productSlug}/purchase/confirm`
            );

            if (response.data.success) {
                // Close modal and redirect to purchases page
                setConfirmationModalOpen(false);
                router.visit('/buys', {
                    onSuccess: () => {
                        // Show success message (handled by Inertia flash)
                    },
                });
            }
        } catch (error: any) {
            console.error('Purchase confirmation failed:', error);

            // Check if this is an already purchased error
            if (error.response?.data?.error_code === 'already_purchased') {
                setConfirmationModalOpen(false);
                setPurchaseError(error.response?.data?.error);
                // Reload the page to update the purchased status
                router.reload();
            } else {
                setPurchaseError(
                    error.response?.data?.error ||
                        'Purchase could not be completed. Please try again.'
                );
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="sticky top-6 space-y-4">
            <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
            />

            {purchaseData && (
                <>
                    <PurchaseConfirmationModal
                        product={purchaseData.product}
                        userBalance={purchaseData.user_balance}
                        formattedBalance={purchaseData.formatted_balance}
                        remainingBalance={purchaseData.remaining_balance}
                        formattedRemainingBalance={
                            purchaseData.formattedRemainingBalance
                        }
                        open={confirmationModalOpen}
                        onOpenChange={setConfirmationModalOpen}
                        onConfirm={handleConfirmPurchase}
                        isProcessing={isProcessing}
                        error={purchaseError}
                    />

                    <InsufficientBalanceModal
                        product={purchaseData.product}
                        userBalance={purchaseData.user_balance}
                        formattedBalance={purchaseData.formatted_balance}
                        shortfall={purchaseData.shortfall}
                        formattedShortfall={purchaseData.formattedShortfall}
                        open={insufficientBalanceModalOpen}
                        onOpenChange={setInsufficientBalanceModalOpen}
                    />
                </>
            )}

            <div className="rounded-2xl bg-card/50 p-5 ring-1 ring-foreground/10 backdrop-blur-sm">
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{price} ₽</span>
                        {originalPrice && (
                            <>
                                <span className="text-sm text-muted-foreground line-through">
                                    {originalPrice} ₽
                                </span>
                                <span className="text-sm font-medium text-destructive">
                                    -{discount}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {isPurchased && preventRepurchase ? (
                        <Button
                            size="lg"
                            disabled
                            className="w-full cursor-not-allowed border border-green-500/40 bg-green-500/10 text-green-600"
                        >
                            У вас уже есть этот товар
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleBuyNow}
                                size="lg"
                                disabled={isPurchasing}
                                className="w-full cursor-pointer border border-primary/40 bg-primary/5 text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                            >
                                {isPurchasing ? 'Загрузка...' : 'Купить сейчас'}
                            </Button>
                            {isPurchased && (
                                <p className="text-center text-sm text-muted-foreground">
                                    Вы уже покупали этот товар<p>Этот товар доступен к покупке снова</p>
                                </p>
                            )}
                        </>
                    )}
                    {demoUrl && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full cursor-pointer border-primary/40 bg-transparent transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            asChild
                        >
                            <a
                                href={demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Посмотреть демо
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-2xl bg-card/50 p-5 ring-1 ring-foreground/10 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${
                                    star <= Math.round(rating)
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-muted-foreground/30'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-medium">
                        {rating.toFixed(1)} ({reviewsCount > 0 ? reviewsCount.toString() : 'Нет отзывов'})
                    </span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                            {author}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>
                            {category}
                            {subcategory && ` → ${subcategory}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {new Date(createdAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-4 w-4" />
                        <span>
                            {downloads.toLocaleString('ru-RU')} скачиваний
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Версия {version}</span>
                    </div>
                </div>
            </div>

           {versions && versions.length > 0 && <ProductVersionHistory versions={versions} />}

        </div>
    );
}
