import AdminLayout from '@/layouts/admin-layout';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Upload, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface Subcategory {
    id: number;
    name: string;
    main_category: {
        id: number;
        name: string;
    };
}

interface PageProps {
    subcategories: Subcategory[];
}

export default function Create({ subcategories }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        subcategory_id: '',
        short_description: '',
        long_description: '',
        current_price: '',
        original_price: '',
        author: '',
        demo_url: '',
        images: [] as File[],
        prevent_repurchase: false,
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const currentImages = data.images.length;
        const availableSlots = 20 - currentImages;

        if (files.length > availableSlots) {
            alert(
                `You can only upload ${availableSlots} more images. Maximum is 20 images.`,
            );
            return;
        }

        const newImages = [...data.images, ...files];
        setData('images', newImages);

        // Create previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/products');
    };

    const groupedSubcategories = subcategories.reduce(
        (acc, sub) => {
            const categoryName = sub.main_category.name;
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(sub);
            return acc;
        },
        {} as Record<string, Subcategory[]>,
    );

    return (
        <AdminLayout title="Create Product">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Create Product</h1>
                    <Link
                        href="/admin/products"
                        className="rounded-md border px-4 py-2 font-medium hover:bg-accent"
                    >
                        Back
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Basic Information
                        </h2>
                        <div className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Product Name
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="My Awesome Product"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Category
                                    <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={data.subcategory_id}
                                    onChange={(e) =>
                                        setData(
                                            'subcategory_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {Object.entries(groupedSubcategories).map(
                                        ([categoryName, subs]) => (
                                            <optgroup
                                                key={categoryName}
                                                label={categoryName}
                                            >
                                                {subs.map((sub) => (
                                                    <option
                                                        key={sub.id}
                                                        value={sub.id}
                                                    >
                                                        {sub.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ),
                                    )}
                                </select>
                                {errors.subcategory_id && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.subcategory_id}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Slug (URL-friendly identifier)
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    placeholder="my-awesome-product"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                {errors.slug && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            {/* Author */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Author
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.author}
                                    onChange={(e) =>
                                        setData('author', e.target.value)
                                    }
                                    placeholder="John Doe"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                {errors.author && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.author}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Descriptions
                        </h2>
                        <div className="space-y-4">
                            {/* Short Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Short Description
                                    <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={data.short_description}
                                    onChange={(e) =>
                                        setData(
                                            'short_description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Brief summary of the product (max 1000 characters)"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    rows={3}
                                    maxLength={1000}
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {data.short_description.length}/1000
                                    characters
                                </p>
                                {errors.short_description && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.short_description}
                                    </p>
                                )}
                            </div>

                            {/* Long Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Long Description (Markdown)
                                    <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={data.long_description}
                                    onChange={(e) =>
                                        setData(
                                            'long_description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Detailed product description in Markdown format"
                                    className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
                                    rows={8}
                                    required
                                />
                                {errors.long_description && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.long_description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Pricing</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Current Price */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Current Price (₽)
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.current_price}
                                    onChange={(e) =>
                                        setData('current_price', e.target.value)
                                    }
                                    placeholder="99.99"
                                    step="0.01"
                                    min="0"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                {errors.current_price && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.current_price}
                                    </p>
                                )}
                            </div>

                            {/* Original Price */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Original Price (₽)
                                    <span className="text-xs text-muted-foreground">
                                        {' '}
                                        (optional, for discount display)
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    value={data.original_price}
                                    onChange={(e) =>
                                        setData(
                                            'original_price',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="149.99"
                                    step="0.01"
                                    min="0"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                />
                                {errors.original_price && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.original_price}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Prevent Repurchase Checkbox */}
                        <div className="mt-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.prevent_repurchase}
                                    onChange={(e) =>
                                        setData(
                                            'prevent_repurchase',
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="text-sm font-medium">
                                    Prevent Re-purchase
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    (Users who already own this product cannot
                                    buy it again)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Demo URL */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Demo</h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Demo URL
                                <span className="text-xs text-muted-foreground">
                                    {' '}
                                    (optional)
                                </span>
                            </label>
                            <input
                                type="url"
                                value={data.demo_url}
                                onChange={(e) =>
                                    setData('demo_url', e.target.value)
                                }
                                placeholder="https://example.com/demo"
                                className="w-full rounded-md border bg-background px-3 py-2"
                            />
                            {errors.demo_url && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.demo_url}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Product Images
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                (up to 20 images, max 10MB each)
                            </span>
                        </h2>

                        {/* Upload Area */}
                        {data.images.length < 20 && (
                            <div className="mb-4">
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20">
                                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Click to upload images
                                    </span>
                                    <span className="mt-1 text-xs text-muted-foreground">
                                        JPG, PNG, GIF (max 10MB each)
                                    </span>
                                    <span className="mt-1 text-xs text-muted-foreground">
                                        {data.images.length}/20 images uploaded
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {imagePreviews.map((preview, index) => (
                                    <div
                                        key={index}
                                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                    >
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errors.images && (
                            <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                {errors.images}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href="/admin/products"
                            className="rounded-md border px-6 py-2 font-medium hover:bg-accent"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
