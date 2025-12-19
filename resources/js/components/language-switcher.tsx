import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = {
    en: {
        nativeName: 'English',
        flag: '🇬🇧',
    },
    ru: {
        nativeName: 'Русский',
        flag: '🇷🇺',
    },
};

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        // Reload to ensure all components update
        window.location.reload();
    };

    const currentLanguage = i18n.language || 'ru';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">
                        {languages[currentLanguage as keyof typeof languages]?.flag}{' '}
                        {languages[currentLanguage as keyof typeof languages]?.nativeName}
                    </span>
                    <span className="sm:hidden">
                        {languages[currentLanguage as keyof typeof languages]?.flag}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.keys(languages).map((lng) => (
                    <DropdownMenuItem
                        key={lng}
                        onClick={() => changeLanguage(lng)}
                        className={`cursor-pointer ${
                            i18n.language === lng ? 'bg-accent' : ''
                        }`}
                    >
                        <span className="mr-2">
                            {languages[lng as keyof typeof languages].flag}
                        </span>
                        {languages[lng as keyof typeof languages].nativeName}
                        {i18n.language === lng && (
                            <span className="ml-auto text-primary">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
