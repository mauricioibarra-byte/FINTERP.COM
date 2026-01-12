"use client"

import { useLanguageStore } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export function LanguageSelector() {
    const { language, setLanguage } = useLanguageStore()

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="w-10 h-8 p-0"
            >
                EN
            </Button>
            <Button
                variant={language === 'es' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('es')}
                className="w-10 h-8 p-0"
            >
                ES
            </Button>
        </div>
    )
}
