import AdminLayout from '@/layouts/admin-layout';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Upload } from 'lucide-react';
import { type FormEvent } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
}

interface PageProps {
    product: Product;
}

export default function Create({ product }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        version_number: '',
        version_name: '',
        short_description: '',
        full_changelog: '',
        is_latest: true,
        archive_file: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/versions`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('archive_file', e.target.files[0]);
        }
    };

    return (
        <AdminLayout title="Create Version">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Create New Version
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Product: {product.name}
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
                            {/* Version Number */}
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
                                    placeholder="1.0.0"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Semantic version (e.g., 1.0.0, 2.1.3)
                                </p>
                                {errors.version_number && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.version_number}
                                    </p>
                                )}
                            </div>

                            {/* Version Name */}
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
                                    placeholder="Bug Fixes and Performance Improvements"
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Human-readable version name
                                </p>
                                {errors.version_name && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.version_name}
                                    </p>
                                )}
                            </div>

                            {/* Mark as Latest */}
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

                    {/* Descriptions */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Changelog
                        </h2>
                        <div className="space-y-4">
                            {/* Short Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Short Description (Markdown)
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
                                    placeholder="Brief summary of changes (max 1000 characters)"
                                    className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
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

                            {/* Full Changelog */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Full Changelog (Markdown)
                                    <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={data.full_changelog}
                                    onChange={(e) =>
                                        setData('full_changelog', e.target.value)
                                    }
                                    placeholder="## What's Changed&#10;&#10;### Added&#10;- New feature X&#10;&#10;### Fixed&#10;- Bug Y"
                                    className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
                                    rows={10}
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Use Markdown formatting for better readability
                                </p>
                                {errors.full_changelog && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.full_changelog}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Archive File */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Archive File
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                (max 500MB)
                            </span>
                        </h2>

                        <div className="space-y-4">
                            {!data.archive_file ? (
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20">
                                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Click to upload archive file
                                    </span>
                                    <span className="mt-1 text-xs text-muted-foreground">
                                        ZIP, RAR, TAR, GZ (max 500MB)
                                    </span>
                                    <input
                                        type="file"
                                        accept=".zip,.rar,.tar,.gz,.tar.gz"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        required
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
                                    <div>
                                        <p className="font-medium">
                                            {data.archive_file.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {(
                                                data.archive_file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{' '}
                                            MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('archive_file', null)
                                        }
                                        className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {errors.archive_file && (
                                <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.archive_file}
                                </p>
                            )}

                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Note:</strong> The archive file will
                                    be stored securely in private storage and
                                    will only be accessible through authorized
                                    download links.
                                </p>
                            </div>
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
                            {processing ? 'Creating...' : 'Create Version'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
