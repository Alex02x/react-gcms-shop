interface ProductHeroProps {
    title: string;
    category: string;
    subcategory?: string;
}

export function ProductHero({
    title,
    category,
    subcategory,
}: ProductHeroProps) {
    return (
        <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-foreground/10 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground/60">
                {category && <a href={`../?category=${category}`}>{category}</a>}
                {category && subcategory && <span>→</span>}
                {subcategory && <a href={`../?category=${category}&subcategory=${subcategory}`}>{subcategory}</a>}
            </div>
            <h1 className="text-3xl font-bold text-balance">{title}</h1>
        </div>
    );
}
