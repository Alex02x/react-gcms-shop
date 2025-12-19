import MDEditor from '@uiw/react-md-editor';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    height?: number;
    maxLength?: number;
}

export function MarkdownEditor({
    value,
    onChange,
    label,
    required = false,
    error,
    placeholder = 'Enter markdown content...',
    height = 400,
    maxLength,
}: MarkdownEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (val?: string) => {
        onChange(val || '');
    };

    if (!mounted) {
        return (
            <div>
                <label className="mb-2 block text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </label>
                <div
                    className="flex items-center justify-center rounded-md border bg-background"
                    style={{ height }}
                >
                    <p className="text-sm text-muted-foreground">
                        Loading editor...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div data-color-mode="dark">
            <label className="mb-2 block text-sm font-medium">
                {label}
                {required && <span className="text-destructive">*</span>}
            </label>
            <div className="markdown-editor-wrapper">
                <MDEditor
                    value={value}
                    onChange={handleChange}
                    height={height}
                    preview="live"
                    className="!rounded-md !border !bg-background"
                    textareaProps={{
                        placeholder,
                        maxLength,
                    }}
                    previewOptions={{
                        className: 'markdown-preview-content',
                    }}
                />
            </div>
            {maxLength && (
                <p className="mt-1 text-xs text-muted-foreground">
                    {value.length}/{maxLength} characters
                </p>
            )}
            {error && (
                <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}
