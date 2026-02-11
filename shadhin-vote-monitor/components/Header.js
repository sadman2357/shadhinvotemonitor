import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

export default function Header() {
    const { t, i18n } = useTranslation('common')
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const toggleLanguage = () => {
        const newLocale = i18n.language === 'bn' ? 'en' : 'bn'
        router.push(router.pathname, router.asPath, { locale: newLocale })
    }

    const navLinks = [
        { href: '/', label: t('nav.home') },
        { href: '/report', label: t('nav.report') },
        { href: '/incidents', label: t('nav.incidents') },
    ]

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="section-container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-secondary-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">শ</span>
                        </div>
                        <span className="font-bold text-xl text-neutral-900">
                            {t('common.appName')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-medium transition-colors ${router.pathname === link.href
                                        ? 'text-primary-900'
                                        : 'text-neutral-700 hover:text-primary-900'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="px-4 py-2 rounded-lg border-2 border-neutral-300 hover:border-primary-900 transition-all font-medium"
                            aria-label="Toggle language"
                        >
                            {i18n.language === 'bn' ? 'English' : 'বাংলা'}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-neutral-200 animate-slide-up">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block py-3 font-medium ${router.pathname === link.href
                                        ? 'text-primary-900'
                                        : 'text-neutral-700'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                toggleLanguage()
                                setMobileMenuOpen(false)
                            }}
                            className="w-full mt-4 px-4 py-2 rounded-lg border-2 border-neutral-300 font-medium"
                        >
                            {i18n.language === 'bn' ? 'English' : 'বাংলা'}
                        </button>
                    </div>
                )}
            </nav>
        </header>
    )
}
