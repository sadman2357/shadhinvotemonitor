import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function Home() {
    const { t } = useTranslation('common')

    return (
        <Layout
            title={`${t('common.appName')} - ${t('common.tagline')}`}
            description={t('common.tagline')}
        >
            {/* Hero Section */}
            <section className="bd-map-bg bg-gradient-to-b from-neutral-50 to-white py-20">
                <div className="section-container text-center">
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        {/* Badge */}
                        <div className="inline-block mb-6 px-4 py-2 bg-primary-100 text-primary-900 rounded-full font-semibold text-sm">
                            🗳️ Bangladesh National Election 2026
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
                            {t('common.appName')}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-neutral-600 mb-8">
                            {t('common.tagline')}
                        </p>

                        {/* Description */}
                        <p className="text-lg text-neutral-700 mb-12 max-w-2xl mx-auto">
                            {t('i18n.language') === 'bn'
                                ? 'নির্বাচনী অনিয়ম প্রত্যক্ষ করেছেন? আপনার রিপোর্ট জমা দিন এবং স্বচ্ছ নির্বাচন নিশ্চিত করতে সাহায্য করুন।'
                                : 'Witnessed electoral irregularities? Submit your report and help ensure transparent elections.'
                            }
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/report" className="btn-primary text-lg px-8 py-4">
                                📸 {t('nav.report')}
                            </Link>
                            <Link href="/incidents" className="btn-outline text-lg px-8 py-4">
                                📋 {t('nav.incidents')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="section-container">
                    <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
                        {t('i18n.language') === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="card p-6 text-center animate-slide-up">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📱</span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                {t('i18n.language') === 'bn' ? '১. রিপোর্ট করুন' : '1. Report'}
                            </h3>
                            <p className="text-neutral-600">
                                {t('i18n.language') === 'bn'
                                    ? 'ছবি বা ভিডিও আপলোড করুন এবং অবস্থান নির্বাচন করুন'
                                    : 'Upload photo or video and select location'
                                }
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                {t('i18n.language') === 'bn' ? '২. যাচাই' : '2. Verification'}
                            </h3>
                            <p className="text-neutral-600">
                                {t('i18n.language') === 'bn'
                                    ? 'আমাদের টিম রিপোর্ট পর্যালোচনা এবং যাচাই করে'
                                    : 'Our team reviews and verifies the report'
                                }
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌐</span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                {t('i18n.language') === 'bn' ? '৩. প্রকাশ' : '3. Publish'}
                            </h3>
                            <p className="text-neutral-600">
                                {t('i18n.language') === 'bn'
                                    ? 'যাচাইকৃত রিপোর্ট সর্বজনীন ফিডে প্রদর্শিত হয়'
                                    : 'Verified reports appear in the public feed'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safety Notice */}
            <section className="py-12 bg-yellow-50 border-y-4 border-yellow-400">
                <div className="section-container">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                            {t('i18n.language') === 'bn' ? 'নিরাপত্তা সতর্কতা' : 'Safety Warning'}
                        </h3>
                        <p className="text-lg text-neutral-700">
                            {t('report.safetyWarning')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-b from-primary-900 to-primary-800 text-white">
                <div className="section-container">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">300+</div>
                            <div className="text-xl text-primary-100">
                                {t('i18n.language') === 'bn' ? 'নির্বাচনী আসন' : 'Electoral Seats'}
                            </div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">64</div>
                            <div className="text-xl text-primary-100">
                                {t('i18n.language') === 'bn' ? 'জেলা' : 'Districts'}
                            </div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">48h</div>
                            <div className="text-xl text-primary-100">
                                {t('i18n.language') === 'bn' ? 'পর্যবেক্ষণ সময়' : 'Monitoring Period'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="section-container text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                        {t('i18n.language') === 'bn'
                            ? 'স্বচ্ছ নির্বাচনে অংশ নিন'
                            : 'Be Part of Transparent Elections'
                        }
                    </h2>
                    <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
                        {t('i18n.language') === 'bn'
                            ? 'আপনার রিপোর্ট গণতন্ত্রকে শক্তিশালী করে'
                            : 'Your report strengthens democracy'
                        }
                    </p>
                    <Link href="/report" className="btn-primary text-lg px-8 py-4 inline-block">
                        {t('nav.report')} →
                    </Link>
                </div>
            </section>
        </Layout>
    )
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    }
}
