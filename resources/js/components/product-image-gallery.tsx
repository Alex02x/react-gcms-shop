import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface ProductImageGalleryProps {
    images: string[];
    title: string;
}

export function ProductImageGallery({
    images,
    title,
}: ProductImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const slides = images.map((src) => ({ src }));

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1,
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1,
        );
    };

    return (
        <>
            <div className="overflow-hidden rounded-2xl bg-card/50 ring-1 ring-foreground/10 backdrop-blur-sm">
                <div className="group relative aspect-[16/9] bg-muted">
                    <img
                        src={images[currentIndex] || '/placeholder.svg'}
                        alt={`${title} - ${currentIndex + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 75vw"
                    />

                    {/* Expand button for lightbox */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-10 w-10 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background/90"
                        onClick={() => setIsLightboxOpen(true)}
                        title="View fullscreen"
                    >
                        <Expand className="h-5 w-5" />
                    </Button>

                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 left-4 h-12 w-12 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background/90"
                                onClick={goToPrevious}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-4 h-12 w-12 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background/90"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>

                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentIndex
                                                ? 'w-8 bg-primary'
                                                : 'w-2 bg-background/60'
                                        }`}
                                        onClick={() => setCurrentIndex(index)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${
                                    index === currentIndex
                                        ? 'ring-primary'
                                        : 'ring-transparent hover:ring-primary/40'
                                }`}
                            >
                                <img
                                    src={image || '/placeholder.svg'}
                                    alt={`${title} preview ${index + 1}`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                slides={slides}
                index={currentIndex}
                on={{
                    view: ({ index }) => setCurrentIndex(index),
                }}
                carousel={{
                    finite: images.length <= 1,
                }}
                styles={{
                    container: {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    },
                }}
            />
        </>
    );
}
