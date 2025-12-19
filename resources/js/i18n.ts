import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import productsEN from './locales/en/products.json';
import adminEN from './locales/en/admin.json';

import commonRU from './locales/ru/common.json';
import authRU from './locales/ru/auth.json';
import productsRU from './locales/ru/products.json';
import adminRU from './locales/ru/admin.json';

// Translation resources
const resources = {
    en: {
        common: commonEN,
        auth: authEN,
        products: productsEN,
        admin: adminEN,
    },
    ru: {
        common: commonRU,
        auth: authRU,
        products: productsRU,
        admin: adminRU,
    },
};

i18n
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,
        lng: 'ru', // Always use Russian
        fallbackLng: 'ru',
        defaultNS: 'common',
        ns: ['common', 'auth', 'products', 'admin'],

        interpolation: {
            escapeValue: false, // React already escapes by default
        },

        // Pluralization for Russian language
        pluralSeparator: '_',

        react: {
            useSuspense: false,
        },
    });

export default i18n;
