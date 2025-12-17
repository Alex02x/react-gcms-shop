import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { useState } from 'react';

interface PurchaseCardProps {
    id: string;
    title: string;
    category: string;
    subcategory?: string;
    purchaseDate: string;
    downloadUrl?: string;
    image?: string;
}

export function PurchaseCard({
    title,
    category,
    subcategory,
    purchaseDate,
    downloadUrl,
    image,
}: PurchaseCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);

        // TODO: Replace with actual Laravel API call
        // const response = await fetch(`/api/purchases/${id}/download`)
        // const blob = await response.blob()
        // Download logic here

        setTimeout(() => {
            setIsLoading(false);
            // Simulate download
            console.log('[v0] Downloading:', title);
        }, 1000);
    };

    return (
        <div className="rounded-2xl border bg-card/50 p-5 backdrop-blur-sm transition-all hover:ring-1 hover:ring-primary/20">
            <div className="flex items-start justify-between gap-4">
                <div className="shrink-0">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                        <img
                            src={image || '/placeholder.svg?height=80&width=80'}
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{category}</span>
                        {subcategory && (
                            <>
                                <span>→</span>
                                <span>{subcategory}</span>
                            </>
                        )}
                    </div>

                    <h3 className="text-lg leading-tight font-semibold">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Приобретено: {purchaseDate}</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/30 bg-transparent transition-all hover:border-primary/50 hover:bg-primary/10"
                    onClick={handleDownload}
                    disabled={isLoading}
                >
                    <Download className="h-4 w-4" />
                    {isLoading ? 'Загрузка...' : 'Получить'}
                </Button>
            </div>
        </div>
    );
}
