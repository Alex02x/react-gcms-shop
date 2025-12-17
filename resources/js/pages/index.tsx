import { parsePrice } from '@/lib/format-utils';
import { CategorySidebar } from '@/components/category-sidebar';
import { ProductCard } from '@/components/product-card';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    subcategories: Subcategory[];
}

interface Subcategory {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    current_price: string | number;
    original_price: string | number | null;
    author: string;
    view_count: number;
    download_count: number;
    reviews_count: number;
    average_rating: number;
    has_discount: boolean;
    image: string | null;
    category: {
        name: string;
        slug: string;
    };
    subcategory: {
        name: string;
        slug: string;
    };
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    categories: Category[];
    products: PaginatedProducts;
    filters: {
        search?: string;
        category?: string;
        subcategory?: string;
    };
}

export default function ShopPage({ categories, products, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        filters.category || null,
    );
    const [selectedSubcategory, setSelectedSubcategory] = useState<
        string | null
    >(filters.subcategory || null);

    const handleCategorySelect = (
        categorySlug: string | null,
        subcategorySlug: string | null,
    ) => {
        setSelectedCategory(categorySlug);
        setSelectedSubcategory(subcategorySlug);

        const params: Record<string, string> = {};
        if (categorySlug) params.category = categorySlug;
        if (subcategorySlug) params.subcategory = subcategorySlug;
        if (searchQuery) params.search = searchQuery;

        router.get('/', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearching(true);

        const params: Record<string, string> = {};
        if (query) params.search = query;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubcategory) params.subcategory = selectedSubcategory;

        router.get('/', params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsSearching(false),
        });
    };

    return (
        <>
            <div className="flex gap-6">
                <div className="hidden w-80 lg:block">
                    <CategorySidebar
                        categories={categories}
                        onSearch={handleSearch}
                        isSearching={isSearching}
                        onCategorySelect={handleCategorySelect}
                        selectedCategory={selectedCategory}
                        selectedSubcategory={selectedSubcategory}
                    />
                </div>
                <main className="flex-1">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">Каталог товаров</h1>
                        <p className="mt-2 text-muted-foreground">
                            Найдите идеальное решение для вашего проекта
                        </p>
                    </div>

                    <div className="space-y-4">
                        {(searchQuery || selectedCategory) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {isSearching && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                <span>
                                    {isSearching
                                        ? 'Загрузка...'
                                        : `Найдено товаров: ${products.total}`}
                                </span>
                            </div>
                        )}

                        {products.data.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        title={product.name}
                                        description={product.short_description}
                                        price={parsePrice(product.current_price)}
                                        originalPrice={
                                            product.original_price
                                                ? parsePrice(
                                                      product.original_price,
                                                  )
                                                : undefined
                                        }
                                        rating={product.average_rating}
                                        images={
                                            product.image ? [product.image] : []
                                        }
                                        category={product.category.name}
                                        subcategory={product.subcategory.name}
                                        slug={product.slug}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    Товары не найдены
                                </p>
                            </div>
                        )}

                        {products.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                {Array.from(
                                    { length: products.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            const params: Record<string, any> =
                                                { page };
                                            if (searchQuery)
                                                params.search = searchQuery;
                                            if (selectedCategory)
                                                params.category =
                                                    selectedCategory;
                                            if (selectedSubcategory)
                                                params.subcategory =
                                                    selectedSubcategory;
                                            router.get('/', params);
                                        }}
                                        className={`rounded px-4 py-2 ${
                                            products.current_page === page
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card hover:bg-accent'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
