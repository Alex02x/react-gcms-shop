import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    rating: number;
    images: string[];
    category: string;
    subcategory: string;
}

interface ProductGridProps {
    searchQuery: string;
    onSearchingChange: (isSearching: boolean) => void;
    selectedCategory: string | null;
    selectedSubcategory: string | null;
}

export function ProductGrid({
    searchQuery,
    onSearchingChange,
    selectedCategory,
    selectedSubcategory,
}: ProductGridProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));

            const mockProducts: Product[] = [
                {
                    id: 1,
                    title: 'RCON SHOP - магазин RCON',
                    description:
                        'Модуль для продажи ваших товаров через команды RCON',
                    price: 550,
                    originalPrice: 800,
                    rating: 4.8,
                    category: 'GameCMS',
                    subcategory: 'Модули',
                    images: [
                        'https://tpl-market.ru/public/uploads/images/product/screenshots/3vcmJ7SyQWfE.jpg',
                        '/game-dashboard-interface.jpg',
                        '/admin-dashboard-dark.jpg',
                    ],
                },
                {
                    id: 2,
                    title: 'UI Components Kit',
                    description:
                        'Набор готовых UI компонентов для вашего проекта',
                    price: 350,
                    originalPrice: 500,
                    rating: 4.5,
                    category: 'Плагины CS 1.6',
                    subcategory: 'UI Kits',
                    images: [
                        '/ui-components-kit.jpg',
                        '/ecommerce-shopping.png',
                    ],
                },
                {
                    id: 3,
                    title: 'Admin Dashboard Dark',
                    description: 'Темная тема для панели администратора',
                    price: 450,
                    rating: 4.9,
                    category: 'GameCMS',
                    subcategory: 'Шаблоны',
                    images: [
                        '/admin-dashboard-dark.jpg',
                        '/game-dashboard-interface.jpg',
                    ],
                },
                {
                    id: 4,
                    title: 'E-commerce Shopping',
                    description:
                        'Модуль интернет-магазина с корзиной и оплатой',
                    price: 750,
                    originalPrice: 1000,
                    rating: 4.7,
                    category: 'GameCMS',
                    subcategory: 'Модули',
                    images: [
                        '/ecommerce-shopping.png',
                        '/ui-components-kit.jpg',
                    ],
                },
                {
                    id: 5,
                    title: 'SEO Analytics',
                    description:
                        'Инструменты для анализа SEO показателей сайта',
                    price: 650,
                    originalPrice: 900,
                    rating: 4.6,
                    category: 'Плагины CS 1.6',
                    subcategory: 'Backend',
                    images: ['/seo-analytics.jpg', '/admin-dashboard-dark.jpg'],
                },
                {
                    id: 6,
                    title: 'Game Dashboard',
                    description: 'Панель управления игровым сервером',
                    price: 850,
                    rating: 4.8,
                    category: 'GameCMS',
                    subcategory: 'Шаблоны',
                    images: [
                        '/game-dashboard-interface.jpg',
                        '/admin-dashboard-dark.jpg',
                    ],
                },
            ];

            setProducts(mockProducts);
            setLoading(false);
        };

        loadProducts();
    }, []);

    useEffect(() => {
        if (!selectedCategory && !selectedSubcategory) return;

        const fetchCategoryProducts = async () => {
            setSearching(true);
            onSearchingChange(true);

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 400));

            // In the future, replace with actual API call:
            // const params = new URLSearchParams()
            // if (selectedCategory) params.append('category', selectedCategory)
            // if (selectedSubcategory) params.append('subcategory', selectedSubcategory)
            // const response = await fetch(`/api/products?${params.toString()}`)
            // const data = await response.json()
            // setProducts(data.products)

            setSearching(false);
            onSearchingChange(false);
        };

        fetchCategoryProducts();
    }, [selectedCategory, selectedSubcategory, onSearchingChange]);

    useEffect(() => {
        if (!searchQuery) {
            onSearchingChange(false);
            return;
        }

        const searchProducts = async () => {
            setSearching(true);
            onSearchingChange(true);

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 300));

            // In the future, replace this with actual API call:
            // const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
            // const data = await response.json()
            // setProducts(data.products)

            setSearching(false);
            onSearchingChange(false);
        };

        searchProducts();
    }, [searchQuery, onSearchingChange]);

    let filteredProducts = products;

    // Apply category filter
    if (selectedCategory && !selectedSubcategory) {
        filteredProducts = filteredProducts.filter(
            (product) => product.category === selectedCategory,
        );
    } else if (selectedCategory && selectedSubcategory) {
        filteredProducts = filteredProducts.filter(
            (product) =>
                product.category === selectedCategory &&
                product.subcategory === selectedSubcategory,
        );
    }

    // Apply search filter
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(
            (product) =>
                product.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                product.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {(searchQuery || selectedCategory) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {searching && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                        {searching
                            ? 'Загрузка...'
                            : `Найдено товаров: ${filteredProducts.length}`}
                    </span>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {(searchQuery || selectedCategory) &&
                filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">
                            Товары не найдены
                        </p>
                    </div>
                )}
        </div>
    );
}
