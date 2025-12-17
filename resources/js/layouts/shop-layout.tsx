import { ShopHeader } from '@/components/shop-header';
import { ThemeProvider } from '@/components/theme-provider';
import { DecorativeBackground } from "@/components/decorative-background"
import type React from 'react';

export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider>
            <DecorativeBackground />
            <div className="min-h-screen bg-background px-4 py-6 font-sans antialiased">
                <div className="mx-auto max-w-[1280px] space-y-6">
                    <ShopHeader />
                    {children}
                    <footer className="p-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground/60">
                            <p>gamecms.su © 2025</p>
                            <a
                                href="/documents"
                                className="transition-colors hover:text-muted-foreground"
                            >
                                Документы
                            </a>
                        </div>
                    </footer>
                </div>
            </div>
        </ThemeProvider>
    );
}
