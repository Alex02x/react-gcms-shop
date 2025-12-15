interface ProductHeroProps {
  title: string
  category: string
  subcategory?: string
}

export function ProductHero({ title, category, subcategory }: ProductHeroProps) {
  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm ring-1 ring-foreground/10 p-6">
      <div className="mb-2 text-sm text-muted-foreground/60 flex items-center gap-1.5">
        {category && <span>{category}</span>}
        {category && subcategory && <span>→</span>}
        {subcategory && <span>{subcategory}</span>}
      </div>
      <h1 className="text-3xl font-bold text-balance">{title}</h1>
    </div>
  )
}
