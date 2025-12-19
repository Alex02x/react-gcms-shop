import { ProductDescription } from '@/components/product-description';
import { ProductHero } from '@/components/product-hero';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductReviews } from '@/components/product-reviews';
import { ProductSidebar } from '@/components/product-sidebar';

interface Product {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    long_description: string;
    current_price: string | number;
    original_price: string | number | null;
    author: string;
    demo_url: string | null;
    view_count: number;
    download_count: number;
    created_at: string;
    has_discount: boolean;
    is_purchased: boolean;
    prevent_repurchase: boolean;
    images: Array<{
        id: number;
        url: string;
        name: string;
    }>;
    category: {
        name: string;
        slug: string;
    };
    subcategory: {
        name: string;
        slug: string;
    };
    latest_version: {
        id: number;
        version_number: string;
        version_name: string;
        created_at: string;
    } | null;
    versions: Array<{
        id: number;
        version_number: string;
        version_name: string;
        short_description: string;
        full_changelog: string;
        download_count: number;
        is_latest: boolean;
        created_at: string;
    }>;
    reviews: Array<{
        id: number;
        rating: number;
        review_text: string;
        created_at: string;
        updated_at: string;
        user: {
            id: number;
            name: string;
            avatar: string | null;
        };
        can_edit: boolean;
        can_delete: boolean;
    }>;
    average_rating: number;
    reviews_count: number;
    user_review: {
        id: number;
        rating: number;
        review_text: string;
        created_at: string;
        updated_at: string;
    } | null;
}

interface Props {
    product: Product;
}

export default function ProductPage({ product }: Props) {
    const imageUrls = product.images.map((img) => img.url);

    const price =
        typeof product.current_price === 'string'
            ? parseFloat(product.current_price)
            : product.current_price;

    const originalPrice = product.original_price
        ? typeof product.original_price === 'string'
            ? parseFloat(product.original_price)
            : product.original_price
        : undefined;

    return (
        <>
            <ProductHero
                title={product.name}
                category={product.category.name}
                subcategory={product.subcategory.name}
            />

            <div className="flex gap-6">
                <main className="flex-1 space-y-6">
                    <ProductImageGallery images={imageUrls} title={product.name} />
                    <ProductDescription content={product.long_description} />
                    <ProductReviews
                        productSlug={product.slug}
                        isPurchased={product.is_purchased}
                        initialReviews={product.reviews}
                        averageRating={product.average_rating}
                        reviewsCount={product.reviews_count}
                        userReview={product.user_review}
                    />
                </main>

                <aside className="hidden w-80 lg:block">
                    <ProductSidebar
                        author={product.author}
                        category={product.category.name}
                        subcategory={product.subcategory.name}
                        createdAt={product.created_at}
                        downloads={product.download_count}
                        version={
                            product.latest_version?.version_number || 'N/A'
                        }
                        rating={product.average_rating}
                        reviewsCount={product.reviews_count}
                        price={price}
                        originalPrice={originalPrice}
                        demoUrl={product.demo_url || undefined}
                        productId={product.id}
                        productSlug={product.slug}
                        versions={product.versions}
                        isPurchased={product.is_purchased}
                        preventRepurchase={product.prevent_repurchase}
                    />
                </aside>
            </div>
        </>
    );
}
