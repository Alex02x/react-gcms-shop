import ReactMarkdown from 'react-markdown';

interface ProductDescriptionProps {
    content: string;
}

export function ProductDescription({ content }: ProductDescriptionProps) {
    return (
        <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-foreground/10 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold">Описание</h2>
            <div className="prose prose-invert prose-emerald max-w-none">
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => (
                            <h1 className="mt-6 mb-4 text-2xl font-bold">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="mt-5 mb-3 text-xl font-bold">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="mt-4 mb-2 text-lg font-semibold">
                                {children}
                            </h3>
                        ),
                        p: ({ children }) => (
                            <p className="mb-4 leading-relaxed text-muted-foreground">
                                {children}
                            </p>
                        ),
                        ul: ({ children }) => (
                            <ul className="mb-4 ml-6 list-disc space-y-2">
                                {children}
                            </ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="mb-4 ml-6 list-decimal space-y-2">
                                {children}
                            </ol>
                        ),
                        li: ({ children }) => (
                            <li className="text-muted-foreground">
                                {children}
                            </li>
                        ),
                        code: ({ children }) => (
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                                {children}
                            </code>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">
                                {children}
                            </strong>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
