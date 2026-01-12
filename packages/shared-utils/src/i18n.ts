import { getTenantId } from './tenant-context';

// Placeholder for a real i18n backend (Redis/S3/DB)
const translations: Record<string, Record<string, string>> = {
    'en-US': {
        'WELCOME': 'Welcome to FintERP',
        'ERROR_GENERIC': 'An unexpected error occurred',
    },
    'es-CL': {
        'WELCOME': 'Bienvenido a FintERP',
        'ERROR_GENERIC': 'Ocurrió un error inesperado',
    }
};

export class I18nService {
    static translate(key: string, locale: string = 'es-CL', params?: Record<string, string>): string {
        const lang = translations[locale] || translations['en-US'];
        let text = lang[key] || key;

        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{{${param}}}`, params[param]);
            });
        }

        return text;
    }

    // Helper to get translation based on Tenant's preferred language (Mocked)
    static t(key: string, params?: Record<string, string>): string {
        // In future: const locale = await getTenantLocale(getTenantId());
        const locale = 'es-CL';
        return this.translate(key, locale, params);
    }
}
