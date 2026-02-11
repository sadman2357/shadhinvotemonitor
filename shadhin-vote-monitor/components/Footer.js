import { useTranslation } from 'next-i18next'

export default function Footer() {
    const { t } = useTranslation('common')

    return (
        <footer className="bg-neutral-900 text-white mt-auto">
            <div className="section-container py-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Disclaimer */}
                    <div>
                        <h3 className="font-bold text-lg mb-2">{t('common.appName')}</h3>
                        <p className="text-neutral-400 text-sm">
                            {t('footer.disclaimer')}
                        </p>
                    </div>

                    {/* Emergency Notice */}
                    <div className="md:text-right">
                        <p className="text-yellow-400 font-semibold text-sm">
                            ⚠️ {t('footer.emergency')}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-800 text-center text-sm text-neutral-500">
                    <p>© 2026 Shadhin Vote Monitor. Civic monitoring platform for Bangladesh.</p>
                </div>
            </div>
        </footer>
    )
}
