import AdminLayout from '@/layouts/admin-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { AlertModal } from '@/components/alert-modal';
import { Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, Trash2, Upload, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Subcategory {
    id: number;
    name: string;
    main_category: {
        id: number;
        name: string;
    };
}

interface Media {
    id: number;
    file_name: string;
    original_url: string;
    preview_url: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    subcategory_id: number;
    short_description: string;
    long_description: string;
    current_price: string | number;
    original_price: string | number | null;
    author: string;
    demo_url: string | null;
    media: Media[];
    subcategory: Subcategory;
    prevent_repurchase: boolean;
    require_telegram_subscription: boolean;
}

interface PageProps {
    product: Product;
    subcategories: Subcategory[];
}

export default function Edit({ product, subcategories }: PageProps) {
    const { t } = useTranslation('products');
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        slug: product.slug,
        subcategory_id: product.subcategory_id.toString(),
        short_description: product.short_description,
        long_description: product.long_description,
        current_price: product.current_price.toString(),
        original_price: product.original_price?.toString() || '',
        author: product.author,
        demo_url: product.demo_url || '',
        prevent_repurchase: product.prevent_repurchase || false,
        require_telegram_subscription: product.require_telegram_subscription || false,
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [deleteImageConfirmOpen, setDeleteImageConfirmOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [maxImagesErrorOpen, setMaxImagesErrorOpen] = useState(false);
    const [availableSlots, setAvailableSlots] = useState(0);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = product.media.length + newImages.length;
        const slots = 20 - totalImages;

        if (files.length > slots) {
            setAvailableSlots(slots);
            setMaxImagesErrorOpen(true);
            return;
        }

        setNewImages([...newImages, ...files]);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index));
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    };

    const deleteExistingImage = (mediaId: number) => {
        setImageToDelete(mediaId);
        setDeleteImageConfirmOpen(true);
    };

    const confirmDeleteImage = () => {
        if (!imageToDelete) return;
        router.delete(`/admin/products/${product.id}/images/${imageToDelete}`, {
            preserveScroll: true,
        });
        setImageToDelete(null);
    };

    const uploadNewImages = () => {
        if (newImages.length === 0) return;

        const formData = new FormData();
        newImages.forEach((image) => {
            formData.append('images[]', image);
        });

        router.post(`/admin/products/${product.id}/images`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setNewImages([]);
                setNewImagePreviews([]);
            },
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/products/${product.id}`);
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
        <AdminLayout title="Edit Product">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit Product</h1>
                    <div className="flex gap-2">
                        <Link
                            href={`/admin/products/${product.id}/versions`}
                            className="rounded-md border px-4 py-2 font-medium hover:bg-accent"
                        >
                            Manage Versions
                        </Link>
                        <Link
                            href="/admin/products"
                            className="rounded-md border px-4 py-2 font-medium hover:bg-accent"
                        >
                            Back
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Product Name<span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
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

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Category<span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={data.subcategory_id}
                                    onChange={(e) => setData('subcategory_id', e.target.value)}
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {Object.entries(groupedSubcategories).map(([categoryName, subs]) => (
                                        <optgroup key={categoryName} label={categoryName}>
                                            {subs.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {errors.subcategory_id && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.subcategory_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Slug<span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
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

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Author<span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.author}
                                    onChange={(e) => setData('author', e.target.value)}
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

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Descriptions</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Short Description<span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={data.short_description}
                                    onChange={(e) => setData('short_description', e.target.value)}
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    rows={3}
                                    maxLength={1000}
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {data.short_description.length}/1000 characters
                                </p>
                                {errors.short_description && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.short_description}
                                    </p>
                                )}
                            </div>

                            <MarkdownEditor
                                value={data.long_description}
                                onChange={(value) =>
                                    setData('long_description', value)
                                }
                                label="Long Description (Markdown)"
                                required
                                error={errors.long_description}
                                placeholder="# Product Description\n\n## Features\n- Feature 1\n- Feature 2"
                                height={400}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Pricing</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Current Price (₽)<span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.current_price}
                                    onChange={(e) => setData('current_price', e.target.value)}
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

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Original Price (₽)
                                    <span className="text-xs text-muted-foreground"> (optional)</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.original_price}
                                    onChange={(e) => setData('original_price', e.target.value)}
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

                        {/* Require Telegram Subscription Checkbox - Only for free products */}
                        {parseFloat(data.current_price) === 0 && (
                            <div className="mt-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.require_telegram_subscription}
                                        onChange={(e) =>
                                            setData(
                                                'require_telegram_subscription',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium">
                                        Require Telegram Channel Subscription
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        (Users must be subscribed to your Telegram channel to download this free product)
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Demo</h2>
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Demo URL<span className="text-xs text-muted-foreground"> (optional)</span>
                            </label>
                            <input
                                type="url"
                                value={data.demo_url}
                                onChange={(e) => setData('demo_url', e.target.value)}
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

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Product Images
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({product.media.length + newImages.length}/20 images)
                            </span>
                        </h2>

                        {product.media.length > 0 && (
                            <div className="mb-4">
                                <h3 className="mb-2 text-sm font-medium">Current Images</h3>
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {product.media.map((media, index) => (
                                        <div
                                            key={media.id}
                                            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                        >
                                            <img
                                                src={media.preview_url || media.original_url}
                                                alt={media.file_name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => deleteExistingImage(media.id)}
                                                className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {newImagePreviews.length > 0 && (
                            <div className="mb-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-sm font-medium">New Images (not saved yet)</h3>
                                    <button
                                        type="button"
                                        onClick={uploadNewImages}
                                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                    >
                                        Upload {newImages.length} image{newImages.length > 1 ? 's' : ''}
                                    </button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {newImagePreviews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                        >
                                            <img
                                                src={preview}
                                                alt={`New ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.media.length + newImages.length < 20 && (
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20">
                                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-medium">Click to add more images</span>
                                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, GIF (max 100MB each)</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

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
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                open={deleteImageConfirmOpen}
                onOpenChange={setDeleteImageConfirmOpen}
                onConfirm={confirmDeleteImage}
                title="Удалить изображение"
                description="Вы уверены, что хотите удалить это изображение? Это действие нельзя отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                variant="destructive"
            />

            <AlertModal
                open={maxImagesErrorOpen}
                onOpenChange={setMaxImagesErrorOpen}
                title="Слишком много изображений"
                description={`Вы можете загрузить еще только ${availableSlots} изображений. Максимум 20 изображений.`}
                type="error"
                buttonText="OK"
            />
        </AdminLayout>
    );
}
