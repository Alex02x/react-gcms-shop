import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ShopLayout from './layouts/shop-layout';

const appName = import.meta.env.VITE_APP_NAME || 'GameCMS.su';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ).then((module: any) => {
            const page = module.default;

            // Don't wrap admin pages - they have their own layout
            if (!name.startsWith('admin/')) {
                page.layout =
                    page.layout ||
                    ((page: React.ReactNode) => (
                        <ShopLayout>{page}</ShopLayout>
                    ));
            }

            return page;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
