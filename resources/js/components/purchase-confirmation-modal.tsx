import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, ShoppingCart, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PurchaseConfirmationModalProps {
    product: {
        id: number;
        name: string;
        price: number;
        formattedPrice: string;
        imageUrl?: string;
    };
    userBalance: number;
    formattedBalance: string;
    remainingBalance: number;
    formattedRemainingBalance: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isProcessing: boolean;
    error?: string;
}

export function PurchaseConfirmationModal({
    product,
    userBalance,
    formattedBalance,
    remainingBalance,
    formattedRemainingBalance,
    open,
    onOpenChange,
    onConfirm,
    isProcessing,
    error,
}: PurchaseConfirmationModalProps) {
    const { t } = useTranslation('products');
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {t('purchase.title')}
                    </DialogTitle>
                    <DialogDescription>
                        Пожалуйста, проверьте детали вашей покупки
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Product Info */}
                    <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                        {product.imageUrl && (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 space-y-1">
                            <p className="font-medium leading-tight">
                                {product.name}
                            </p>
                            <p className="text-lg font-bold text-primary">
                                {product.formattedPrice}
                            </p>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-2 rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {t('purchase.current_balance')}:
                            </span>
                            <span className="font-medium">
                                {formattedBalance}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Стоимость товара:
                            </span>
                            <span className="font-medium text-destructive">
                                -{product.formattedPrice}
                            </span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-sm font-medium">
                                <Wallet className="h-4 w-4" />
                                {t('purchase.balance_after')}:
                            </span>
                            <span className="text-lg font-bold text-emerald-500">
                                {formattedRemainingBalance}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        {t('purchase.cancel_button')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                {t('purchase.processing')}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                {t('purchase.confirm_button')}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
