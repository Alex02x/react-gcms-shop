import AdminLayout from '@/layouts/admin-layout';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Link, router } from '@inertiajs/react';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Subcategory {
    id: number;
    name: string;
    main_category: {
        id: number;
        name: string;
    };
}

interface Product {
    id: number;
    name: string;
    slug: string;
    author: string;
    short_description: string;
    current_price: string | number;
    original_price: string | number | null;
    view_count: number;
    download_count: number;
    created_at: string;
    subcategory: Subcategory;
}

interface PageProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    subcategories: Subcategory[];
    filters: Record<string, string>;
}

export default function Index({ products, subcategories, filters }: PageProps) {
    const { t } = useTranslation('products');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return `₽${numPrice.toFixed(2)}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDelete = (productId: number, productName: string) => {
        setProductToDelete({ id: productId, name: productName });
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!productToDelete) return;
        router.delete(`/admin/products/${productToDelete.id}`);
        setProductToDelete(null);
    };

    return (
        <AdminLayout title="Product Management">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-card">
                    {products.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">
                                No products yet
                            </h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Get started by creating your first product
                            </p>
                            <Link
                                href="/admin/products/create"
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Author
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Stats
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">
                                                    {product.name}
                                                </div>
                                                <div className="line-clamp-1 text-sm text-muted-foreground">
                                                    {product.short_description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div>
                                                <div className="font-medium">
                                                    {
                                                        product.subcategory
                                                            .main_category.name
                                                    }
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {product.subcategory.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.author}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">
                                                    {formatPrice(
                                                        product.current_price,
                                                    )}
                                                </div>
                                                {product.original_price && (
                                                    <div className="text-xs text-muted-foreground line-through">
                                                        {formatPrice(
                                                            product.original_price,
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="space-y-1">
                                                <div className="text-muted-foreground">
                                                    👁️ {product.view_count}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    ⬇️ {product.download_count}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {formatDate(product.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/versions`}
                                                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                                                >
                                                    <Package className="h-4 w-4" />
                                                    Versions
                                                </Link>
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.id,
                                                            product.name,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {products.data.length} of {products.total}{' '}
                            products
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: products.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Link
                                    key={page}
                                    href={`/admin/products?page=${page}`}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        page === products.current_page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border hover:bg-accent'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={confirmDelete}
                title="Удалить продукт"
                description={`Вы уверены, что хотите удалить "${productToDelete?.name}"? Это действие нельзя отменить, и все связанные данные будут безвозвратно удалены.`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="destructive"
            />
        </AdminLayout>
    );
}
