import AdminLayout from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import { Package, Plus } from 'lucide-react';

interface ProductVersion {
    id: number;
    version_number: string;
    version_name: string;
    download_count: number;
    is_latest: boolean;
    created_at: string;
}

interface Product {
    id: number;
    slug: string;
    short_description: string;
}

interface PageProps {
    product: Product;
    versions: ProductVersion[];
}

export default function Index({ product, versions }: PageProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout title="Product Versions">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Versions</h1>
                        <p className="text-sm text-muted-foreground">
                            {product.slug}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-md border px-4 py-2 font-medium hover:bg-accent"
                        >
                            Back to Product
                        </Link>
                        <Link
                            href={`/admin/products/${product.id}/versions/create`}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Version
                        </Link>
                    </div>
                </div>

                {/* Versions List */}
                <div className="space-y-2">
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className="flex items-center justify-between rounded-lg border bg-card p-4"
                        >
                            <div className="flex items-center gap-4">
                                <Package className="h-8 w-8 text-primary" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">
                                            {version.version_number}
                                        </h3>
                                        {version.is_latest && (
                                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                Latest
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {version.version_name}
                                    </p>
                                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                                        <span>
                                            ⬇️ {version.download_count}{' '}
                                            downloads
                                        </span>
                                        <span>
                                            📅 {formatDate(version.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/admin/products/${product.id}/versions/${version.id}/edit`}
                                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                Edit
                            </Link>
                        </div>
                    ))}

                    {versions.length === 0 && (
                        <div className="rounded-lg border bg-card p-8 text-center">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 font-semibold">
                                No versions yet
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Get started by creating your first version.
                            </p>
                            <Link
                                href={`/admin/products/${product.id}/versions/create`}
                                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                                Add Version
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
