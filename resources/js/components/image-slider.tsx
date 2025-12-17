import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
    images: string[];
    alt: string;
}

export function ImageSlider({ images, alt }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

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

    if (images.length === 0) return null;

    return (
        <div className="group relative aspect-video overflow-hidden bg-muted">
            <img
                src={images[currentIndex] || '/placeholder.svg'}
                alt={`${alt} - ${currentIndex + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
            />

            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background/90"
                        onClick={(e) => {
                            e.preventDefault();
                            goToPrevious();
                        }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-background/90"
                        onClick={(e) => {
                            e.preventDefault();
                            goToNext();
                        }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'w-6 bg-primary'
                                        : 'w-1.5 bg-background/60'
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentIndex(index);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
