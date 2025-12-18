import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface PurchaseCardProps {
    id: number;
    title: string;
    category: string;
    subcategory?: string;
    purchaseDate: string;
    downloadUrl?: string;
    image?: string;
}

export function PurchaseCard({
    id,
    title,
    category,
    subcategory,
    purchaseDate,
    downloadUrl,
    image,
}: PurchaseCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/purchases/${id}/download`, {
                responseType: 'blob',
            });

            // Create blob URL and trigger download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from Content-Disposition header or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${title}.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Download failed:', err);
            setError('Failed to download. Please try again.');
        } finally {
            setIsLoading(false);
        }
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

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
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
