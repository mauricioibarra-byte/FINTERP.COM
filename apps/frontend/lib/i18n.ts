import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'es';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    }
};

const translations: Translations = {
    en: {
        'nav.dashboard': 'Dashboard',
        'nav.partners': 'Partners',
        'nav.invoices': 'Invoices',
        'nav.payments': 'Payments',
        'nav.treasury': 'Treasury',
        'nav.settings': 'Settings',
        'settings.title': 'Settings & Administration',
        'settings.desc': 'Manage your organization profile, users, and access controls.',
        'common.save': 'Save Changes',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.cancel': 'Cancel',
    },
    es: {
        'nav.dashboard': 'Tablero',
        'nav.partners': 'Socios',
        'nav.invoices': 'Facturas',
        'nav.payments': 'Pagos',
        'nav.treasury': 'Tesorería',
        'nav.settings': 'Configuración',
        'settings.title': 'Configuración y Administración',
        'settings.desc': 'Administra el perfil de tu organización y controles de acceso.',
        'common.save': 'Guardar Cambios',
        'common.edit': 'Editar',
        'common.delete': 'Eliminar',
        'common.cancel': 'Cancelar',
    }
};

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: (language) => set({ language }),
            t: (key) => {
                const lang = get().language;
                return translations[lang][key] || key;
            }
        }),
        {
            name: 'language-storage',
        }
    )
);
