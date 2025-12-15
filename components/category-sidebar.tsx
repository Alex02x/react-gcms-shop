"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Category {
  name: string
  subcategories: string[]
}

interface CategorySidebarProps {
  onSearch: (query: string) => void
  isSearching: boolean
  onCategorySelect: (category: string | null, subcategory: string | null) => void
  selectedCategory: string | null
  selectedSubcategory: string | null
}

export function CategorySidebar({
  onSearch,
  isSearching,
  onCategorySelect,
  selectedCategory,
  selectedSubcategory,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["GameCMS"])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadCategories = async () => {
      // In the future: const response = await fetch('/api/categories')
      // const data = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockCategories: Category[] = [
        {
          name: "GameCMS",
          subcategories: ["Модули", "Шаблоны"],
        },
        {
          name: "Плагины CS 1.6",
          subcategories: ["Frontend", "Backend", "Full Stack", "UI Kits"],
        },
      ]

      setCategories(mockCategories)
      setLoading(false)
    }

    loadCategories()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Debounce search to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      onSearch(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName && !selectedSubcategory) {
      // Deselect if already selected
      onCategorySelect(null, null)
    } else {
      // Select category
      onCategorySelect(categoryName, null)
    }
    toggleCategory(categoryName)
  }

  const handleSubcategoryClick = (categoryName: string, subcategoryName: string) => {
    if (selectedCategory === categoryName && selectedSubcategory === subcategoryName) {
      // Deselect if already selected
      onCategorySelect(null, null)
    } else {
      // Select subcategory
      onCategorySelect(categoryName, subcategoryName)
    }
  }

  return (
    <aside className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Поиск товаров..." className="pl-9 pr-9" value={searchQuery} onChange={handleSearchChange} />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="mb-3 text-sm font-semibold">Категории</h3>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.name)
            const isCategorySelected = selectedCategory === category.name && !selectedSubcategory
            return (
              <div key={category.name} className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-2 text-sm ${isCategorySelected ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {isExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                  {category.name}
                </Button>
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    {category.subcategories.map((sub) => {
                      const isSubcategorySelected = selectedCategory === category.name && selectedSubcategory === sub
                      return (
                        <Button
                          key={sub}
                          variant="ghost"
                          className={`w-full justify-start px-2 text-sm ${
                            isSubcategorySelected
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => handleSubcategoryClick(category.name, sub)}
                        >
                          {sub}
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
