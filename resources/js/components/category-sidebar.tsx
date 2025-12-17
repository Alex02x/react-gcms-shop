import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface CategorySidebarProps {
    categories: Category[];
    onSearch: (query: string) => void;
    isSearching: boolean;
    onCategorySelect: (
        categorySlug: string | null,
        subcategorySlug: string | null,
    ) => void;
    selectedCategory: string | null;
    selectedSubcategory: string | null;
}

export function CategorySidebar({
    categories,
    onSearch,
    isSearching,
    onCategorySelect,
    selectedCategory,
    selectedSubcategory,
}: CategorySidebarProps) {
    const [expandedCategories, setExpandedCategories] = useState<string[]>(
        categories.length > 0 ? [categories[0].slug] : [],
    );
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Debounce search to avoid excessive API calls
        const timeoutId = setTimeout(() => {
            onSearch(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const toggleCategory = (categorySlug: string) => {
        setExpandedCategories((prev) =>
            prev.includes(categorySlug)
                ? prev.filter((slug) => slug !== categorySlug)
                : [...prev, categorySlug],
        );
    };

    const handleCategoryClick = (categorySlug: string) => {
        if (selectedCategory === categorySlug && !selectedSubcategory) {
            // Deselect if already selected
            onCategorySelect(null, null);
        } else {
            // Select category
            onCategorySelect(categorySlug, null);
        }
        toggleCategory(categorySlug);
    };

    const handleSubcategoryClick = (
        categorySlug: string,
        subcategorySlug: string,
    ) => {
        if (
            selectedCategory === categorySlug &&
            selectedSubcategory === subcategorySlug
        ) {
            // Deselect if already selected
            onCategorySelect(null, null);
        } else {
            // Select subcategory
            onCategorySelect(categorySlug, subcategorySlug);
        }
    };

    return (
        <aside className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
            <div className="relative mb-6">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Поиск товаров..."
                    className="pr-9 pl-9"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {isSearching && (
                    <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
            </div>

            <div className="space-y-1">
                <h3 className="mb-3 text-sm font-semibold">Категории</h3>

                {categories.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Категории не найдены
                    </div>
                ) : (
                    categories.map((category) => {
                        const isExpanded = expandedCategories.includes(
                            category.slug,
                        );
                        const isCategorySelected =
                            selectedCategory === category.slug &&
                            !selectedSubcategory;
                        return (
                            <div key={category.id} className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start px-2 text-sm ${isCategorySelected ? 'bg-primary/10 text-primary' : ''}`}
                                    onClick={() =>
                                        handleCategoryClick(category.slug)
                                    }
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="mr-2 h-4 w-4" />
                                    )}
                                    {category.name}
                                </Button>
                                {isExpanded && (
                                    <div className="ml-6 space-y-1">
                                        {category.subcategories.map((sub) => {
                                            const isSubcategorySelected =
                                                selectedCategory ===
                                                    category.slug &&
                                                selectedSubcategory === sub.slug;
                                            return (
                                                <Button
                                                    key={sub.id}
                                                    variant="ghost"
                                                    className={`w-full justify-start px-2 text-sm ${
                                                        isSubcategorySelected
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                    onClick={() =>
                                                        handleSubcategoryClick(
                                                            category.slug,
                                                            sub.slug,
                                                        )
                                                    }
                                                >
                                                    {sub.name}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
