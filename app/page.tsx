"use client"

import { useState } from "react"
import { CategorySidebar } from "@/components/category-sidebar"
import { ProductGrid } from "@/components/product-grid"

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const handleCategorySelect = (category: string | null, subcategory: string | null) => {
    setSelectedCategory(category)
    setSelectedSubcategory(subcategory)
  }

  return (
    <>
      <div className="flex gap-6">
        <div className="hidden w-80 lg:block">
          <CategorySidebar
            onSearch={setSearchQuery}
            isSearching={isSearching}
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        </div>
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Каталог товаров</h1>
            <p className="mt-2 text-muted-foreground">Найдите идеальное решение для вашего проекта</p>
          </div>
          <ProductGrid
            searchQuery={searchQuery}
            onSearchingChange={setIsSearching}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        </main>
      </div>
    </>
  )
}
