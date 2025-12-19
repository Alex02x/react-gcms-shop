import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
}

export function AlertModal({
    open,
    onOpenChange,
    title,
    description,
    type = 'info',
    buttonText = 'OK',
}: AlertModalProps) {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500/10';
            case 'error':
                return 'bg-destructive/10';
            default:
                return 'bg-blue-500/10';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${getBackgroundColor()}`}
                        >
                            {getIcon()}
                        </div>
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-left">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
