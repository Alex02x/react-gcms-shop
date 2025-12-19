import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Wallet } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface InsufficientBalanceModalProps {
    product: {
        name: string;
        price: number;
        formattedPrice: string;
    };
    userBalance: number;
    formattedBalance: string;
    shortfall: number;
    formattedShortfall: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InsufficientBalanceModal({
    product,
    userBalance,
    formattedBalance,
    shortfall,
    formattedShortfall,
    open,
    onOpenChange,
}: InsufficientBalanceModalProps) {
    const { t } = useTranslation('products');
    
    const handleTopUp = () => {
        onOpenChange(false);
        router.visit('/wallet');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        {t('insufficient_balance.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('insufficient_balance.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Alert Message */}
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-center text-sm text-foreground">
                            {t('insufficient_balance.message')}
                        </p>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('insufficient_balance.product_cost')}: {product.formattedPrice}
                        </p>
                    </div>

                    {/* Balance Comparison */}
                    <div className="space-y-2 rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {t('insufficient_balance.your_balance')}:
                            </span>
                            <span className="font-medium">
                                {formattedBalance}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                {t('insufficient_balance.required')}:
                            </span>
                            <span className="font-medium">
                                {product.formattedPrice}
                            </span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-sm font-medium text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                {t('insufficient_balance.shortfall')}:
                            </span>
                            <span className="text-lg font-bold text-destructive">
                                {formattedShortfall}
                            </span>
                        </div>
                    </div>

                    {/* Info Message */}
                    <p className="rounded-lg bg-primary/10 p-3 text-center text-sm text-foreground">
                        {t('insufficient_balance.top_up_message', { amount: formattedShortfall })}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('insufficient_balance.cancel_button')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleTopUp}
                        className="gap-2"
                    >
                        <Wallet className="h-4 w-4" />
                        {t('insufficient_balance.top_up_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
