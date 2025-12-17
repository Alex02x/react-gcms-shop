import AdminLayout from '@/layouts/admin-layout';
import { router } from '@inertiajs/react';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Subcategory {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
}

interface MainCategory {
    id: number;
    name: string;
    slug: string;
    subcategories_count: number;
    subcategories: Subcategory[];
}

interface PageProps {
    categories: MainCategory[];
    filters: Record<string, string>;
}

export default function Index({ categories }: PageProps) {
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<number | null>(
        null,
    );
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'main' | 'sub';
        id: number;
    } | null>(null);

    const [newMainCategory, setNewMainCategory] = useState({
        name: '',
        slug: '',
    });
    const [newSubcategory, setNewSubcategory] = useState({
        name: '',
        slug: '',
        main_category_id: 0,
    });

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId],
        );
    };

    const handleCreateMainCategory = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/categories/main', newMainCategory, {
            onSuccess: () => {
                setNewMainCategory({ name: '', slug: '' });
            },
        });
    };

    const handleCreateSubcategory = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/categories/sub', newSubcategory, {
            onSuccess: () => {
                setNewSubcategory({ name: '', slug: '', main_category_id: 0 });
            },
        });
    };

    const handleDeleteMain = (categoryId: number) => {
        router.delete(`/admin/categories/main/${categoryId}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    const handleDeleteSub = (subcategoryId: number) => {
        router.delete(`/admin/categories/sub/${subcategoryId}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    return (
        <AdminLayout title="Category Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                </div>

                {/* Create Main Category Form */}
                <div className="rounded-lg border bg-card p-4">
                    <h2 className="mb-4 text-lg font-semibold">
                        Create Main Category
                    </h2>
                    <form
                        onSubmit={handleCreateMainCategory}
                        className="flex gap-4"
                    >
                        <input
                            type="text"
                            placeholder="Category name"
                            value={newMainCategory.name}
                            onChange={(e) =>
                                setNewMainCategory({
                                    ...newMainCategory,
                                    name: e.target.value,
                                })
                            }
                            className="flex-1 rounded-md border bg-background px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Slug (optional)"
                            value={newMainCategory.slug}
                            onChange={(e) =>
                                setNewMainCategory({
                                    ...newMainCategory,
                                    slug: e.target.value,
                                })
                            }
                            className="flex-1 rounded-md border bg-background px-3 py-2"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Create
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="space-y-2">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="rounded-lg border bg-card"
                        >
                            {/* Main Category */}
                            <div className="flex items-center justify-between p-4">
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="flex flex-1 items-center gap-3 text-left"
                                >
                                    {expandedCategories.includes(
                                        category.id,
                                    ) ? (
                                        <FolderOpen className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Folder className="h-5 w-5" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {category.subcategories_count}{' '}
                                            subcategories
                                        </p>
                                    </div>
                                </button>

                                <div className="flex gap-2">
                                    {deleteConfirm?.type === 'main' &&
                                    deleteConfirm?.id === category.id ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleDeleteMain(
                                                        category.id,
                                                    )
                                                }
                                                className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteConfirm(null)
                                                }
                                                className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setDeleteConfirm({
                                                    type: 'main',
                                                    id: category.id,
                                                })
                                            }
                                            className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Subcategories */}
                            {expandedCategories.includes(category.id) && (
                                <div className="border-t bg-muted/20 p-4">
                                    {/* Create Subcategory Form */}
                                    <form
                                        onSubmit={handleCreateSubcategory}
                                        className="mb-4 flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Subcategory name"
                                            value={
                                                newSubcategory.main_category_id ===
                                                category.id
                                                    ? newSubcategory.name
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                setNewSubcategory({
                                                    name: e.target.value,
                                                    slug: '',
                                                    main_category_id:
                                                        category.id,
                                                })
                                            }
                                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add
                                        </button>
                                    </form>

                                    {/* Subcategories List */}
                                    <div className="space-y-2">
                                        {category.subcategories.map(
                                            (subcategory) => (
                                                <div
                                                    key={subcategory.id}
                                                    className="flex items-center justify-between rounded-md bg-background p-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {subcategory.name}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {subcategory.slug}
                                                        </span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {deleteConfirm?.type ===
                                                            'sub' &&
                                                        deleteConfirm?.id ===
                                                            subcategory.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteSub(
                                                                            subcategory.id,
                                                                        )
                                                                    }
                                                                    className="rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setDeleteConfirm(
                                                                            null,
                                                                        )
                                                                    }
                                                                    className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    setDeleteConfirm(
                                                                        {
                                                                            type: 'sub',
                                                                            id: subcategory.id,
                                                                        },
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
