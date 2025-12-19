import AdminLayout from '@/layouts/admin-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, Upload } from 'lucide-react';
import { type FormEvent } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
}

interface Media {
    id: number;
    file_name: string;
    size: number;
}

interface ProductVersion {
    id: number;
    version_number: string;
    version_name: string;
    short_description: string;
    full_changelog: string;
    is_latest: boolean;
    download_count: number;
    media: Media[];
}

interface PageProps {
    product: Product;
    version: ProductVersion;
}

export default function Edit({ product, version }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        version_number: version.version_number,
        version_name: version.version_name,
        short_description: version.short_description,
        full_changelog: version.full_changelog,
        is_latest: version.is_latest,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/products/${product.id}/versions/${version.id}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const formData = new FormData();
            formData.append('archive_file', e.target.files[0]);

            router.post(
                `/admin/products/${product.id}/versions/${version.id}/archive`,
                formData,
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const archiveFile = version.media.find(() => true);

    return (
        <AdminLayout title="Edit Version">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Version</h1>
                        <p className="text-sm text-muted-foreground">
                            Product: {product.name} / Version:{' '}
                            {version.version_number}
                        </p>
                    </div>
                    <Link
                        href={`/admin/products/${product.id}/versions`}
                        className="rounded-md border px-4 py-2 font-medium hover:bg-accent"
                    >
                        Back
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Version Information */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Version Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Version Number
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.version_number}
                                    onChange={(e) =>
                                        setData('version_number', e.target.value)
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                {errors.version_number && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.version_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Version Name
                                    <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.version_name}
                                    onChange={(e) =>
                                        setData('version_name', e.target.value)
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                {errors.version_name && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.version_name}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_latest"
                                    checked={data.is_latest}
                                    onChange={(e) =>
                                        setData('is_latest', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label
                                    htmlFor="is_latest"
                                    className="text-sm font-medium"
                                >
                                    Mark as latest version
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Changelog */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Changelog
                        </h2>
                        <div className="space-y-4">
                            <MarkdownEditor
                                value={data.short_description}
                                onChange={(value) =>
                                    setData('short_description', value)
                                }
                                label="Short Description (Markdown)"
                                required
                                error={errors.short_description}
                                placeholder="Brief summary of changes"
                                height={200}
                                maxLength={1000}
                            />

                            <MarkdownEditor
                                value={data.full_changelog}
                                onChange={(value) =>
                                    setData('full_changelog', value)
                                }
                                label="Full Changelog (Markdown)"
                                required
                                error={errors.full_changelog}
                                placeholder="## What's Changed\n\n### Added\n- New feature X"
                                height={400}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href={`/admin/products/${product.id}/versions`}
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

                {/* Archive File Management */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Archive File
                    </h2>

                    {archiveFile ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
                                <div>
                                    <p className="font-medium">
                                        {archiveFile.file_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {(archiveFile.size / 1024 / 1024).toFixed(
                                            2,
                                        )}{' '}
                                        MB
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-4 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20">
                                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Replace archive file
                                    </span>
                                    <span className="mt-1 text-xs text-muted-foreground">
                                        ZIP, RAR, TAR, GZ (max 500MB)
                                    </span>
                                    <input
                                        type="file"
                                        accept=".zip,.rar,.tar,.gz,.tar.gz"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20">
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Upload archive file
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground">
                                ZIP, RAR, TAR, GZ (max 500MB)
                            </span>
                            <input
                                type="file"
                                accept=".zip,.rar,.tar,.gz,.tar.gz"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
