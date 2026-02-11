import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { bangladeshData, getDistricts } from '../data/bangladesh-data'
import ReCAPTCHA from 'react-google-recaptcha'

export default function ReportPage() {
    const { t } = useTranslation('common')

    const [formData, setFormData] = useState({
        district: '',
        constituency: '',
        votingCenterNumber: '',
        description: '',
        gpsLatitude: '',
        gpsLongitude: '',
        media: null
    })

    const [constituencies, setConstituencies] = useState([])
    const [mediaPreview, setMediaPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [recaptchaToken, setRecaptchaToken] = useState(null)
    const [charCount, setCharCount] = useState(0)

    const districts = getDistricts()

    // Update constituencies when district changes
    useEffect(() => {
        if (formData.district) {
            setConstituencies(bangladeshData[formData.district] || [])
            setFormData(prev => ({ ...prev, constituency: '' }))
        } else {
            setConstituencies([])
        }
    }, [formData.district])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'description') {
            setCharCount(value.length)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]

        if (!file) return

        // Validate file size (20MB)
        if (file.size > 20 * 1024 * 1024) {
            setError(t('i18n.language') === 'bn'
                ? 'ফাইলের আকার ২০ এমবি এর বেশি হতে পারবে না'
                : 'File size must not exceed 20MB'
            )
            return
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4']
        if (!allowedTypes.includes(file.type)) {
            setError(t('i18n.language') === 'bn'
                ? 'শুধুমাত্র JPG, PNG, এবং MP4 ফাইল অনুমোদিত'
                : 'Only JPG, PNG, and MP4 files are allowed'
            )
            return
        }

        setFormData(prev => ({ ...prev, media: file }))

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setMediaPreview(reader.result)
        }
        reader.readAsDataURL(file)
        setError(null)
    }

    const detectLocation = () => {
        if ('geolocation' in navigator) {
            setLoading(true)
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        gpsLatitude: position.coords.latitude.toFixed(6),
                        gpsLongitude: position.coords.longitude.toFixed(6)
                    }))
                    setLoading(false)
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    setError(t('i18n.language') === 'bn'
                        ? 'অবস্থান সনাক্ত করতে ব্যর্থ'
                        : 'Failed to detect location'
                    )
                    setLoading(false)
                }
            )
        } else {
            setError(t('i18n.language') === 'bn'
                ? 'আপনার ব্রাউজার GPS সমর্থন করে না'
                : 'Your browser does not support GPS'
            )
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        // Validation
        if (!formData.district || !formData.constituency || !formData.votingCenterNumber || !formData.media) {
            setError(t('i18n.language') === 'bn'
                ? 'সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন'
                : 'Please fill all required fields'
            )
            return
        }

        if (!recaptchaToken) {
            setError(t('i18n.language') === 'bn'
                ? 'অনুগ্রহ করে reCAPTCHA সম্পূর্ণ করুন'
                : 'Please complete the reCAPTCHA'
            )
            return
        }

        setLoading(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('district', formData.district)
            formDataToSend.append('constituency', formData.constituency)
            formDataToSend.append('votingCenterNumber', formData.votingCenterNumber)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('gpsLatitude', formData.gpsLatitude)
            formDataToSend.append('gpsLongitude', formData.gpsLongitude)
            formDataToSend.append('media', formData.media)
            formDataToSend.append('recaptchaToken', recaptchaToken)

            const response = await fetch('/api/reports/submit', {
                method: 'POST',
                body: formDataToSend
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                // Reset form
                setFormData({
                    district: '',
                    constituency: '',
                    votingCenterNumber: '',
                    description: '',
                    gpsLatitude: '',
                    gpsLongitude: '',
                    media: null
                })
                setMediaPreview(null)
                setCharCount(0)
                setRecaptchaToken(null)
            } else {
                setError(data.message || t('report.errorMessage'))
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError(t('report.errorMessage'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout
            title={`${t('report.title')} - ${t('common.appName')}`}
            description={t('report.subtitle')}
        >
            <div className="section-container py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="page-title">{t('report.title')}</h1>
                        <p className="page-subtitle">{t('report.subtitle')}</p>
                    </div>

                    {/* Safety Warning */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                        <p className="text-yellow-800 font-medium">
                            {t('report.safetyWarning')}
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 animate-slide-up">
                            <p className="text-green-800 font-medium">
                                ✓ {t('report.successMessage')}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 animate-slide-up">
                            <p className="text-red-800 font-medium">
                                ✗ {error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                        {/* District */}
                        <div>
                            <label htmlFor="district" className="block font-semibold text-neutral-900 mb-2">
                                {t('report.district')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className="input-field"
                                required
                            >
                                <option value="">{t('report.selectDistrict')}</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Constituency */}
                        <div>
                            <label htmlFor="constituency" className="block font-semibold text-neutral-900 mb-2">
                                {t('report.constituency')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="constituency"
                                name="constituency"
                                value={formData.constituency}
                                onChange={handleInputChange}
                                className="input-field"
                                required
                                disabled={!formData.district}
                            >
                                <option value="">{t('report.selectConstituency')}</option>
                                {constituencies.map(constituency => (
                                    <option key={constituency} value={constituency}>{constituency}</option>
                                ))}
                            </select>
                        </div>

                        {/* Voting Center Number */}
                        <div>
                            <label htmlFor="votingCenterNumber" className="block font-semibold text-neutral-900 mb-2">
                                {t('report.votingCenter')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="votingCenterNumber"
                                name="votingCenterNumber"
                                value={formData.votingCenterNumber}
                                onChange={handleInputChange}
                                placeholder={t('report.votingCenterPlaceholder')}
                                className="input-field"
                                required
                            />
                        </div>

                        {/* GPS Location */}
                        <div>
                            <label className="block font-semibold text-neutral-900 mb-2">
                                {t('report.gpsLocation')} ({t('i18n.language') === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    name="gpsLatitude"
                                    value={formData.gpsLatitude}
                                    onChange={handleInputChange}
                                    placeholder="Latitude"
                                    className="input-field"
                                    readOnly
                                />
                                <input
                                    type="text"
                                    name="gpsLongitude"
                                    value={formData.gpsLongitude}
                                    onChange={handleInputChange}
                                    placeholder="Longitude"
                                    className="input-field"
                                    readOnly
                                />
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    className="btn-outline whitespace-nowrap"
                                    disabled={loading}
                                >
                                    📍 {t('report.detectLocation')}
                                </button>
                            </div>
                        </div>

                        {/* Media Upload */}
                        <div>
                            <label htmlFor="media" className="block font-semibold text-neutral-900 mb-2">
                                {t('report.uploadMedia')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                id="media"
                                accept="image/jpeg,image/png,video/mp4"
                                onChange={handleFileChange}
                                className="input-field"
                                required
                            />
                            <p className="text-sm text-neutral-600 mt-1">{t('report.uploadHint')}</p>

                            {/* Preview */}
                            {mediaPreview && (
                                <div className="mt-4">
                                    {formData.media?.type.startsWith('image/') ? (
                                        <img src={mediaPreview} alt="Preview" className="max-w-full h-auto rounded-lg" />
                                    ) : (
                                        <video src={mediaPreview} controls className="max-w-full h-auto rounded-lg" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block font-semibold text-neutral-900 mb-2">
                                {t('report.description')}
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder={t('report.descriptionPlaceholder')}
                                maxLength={300}
                                rows={4}
                                className="input-field resize-none"
                            />
                            <p className="text-sm text-neutral-600 mt-1">
                                {charCount}/300 {t('i18n.language') === 'bn' ? 'অক্ষর' : 'characters'}
                            </p>
                        </div>

                        {/* reCAPTCHA */}
                        <div className="flex justify-center">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                onChange={setRecaptchaToken}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-primary w-full text-lg py-4"
                            disabled={loading}
                        >
                            {loading ? t('report.submitting') : t('report.submitReport')}
                        </button>
                    </form>
                </div>
            </div>
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
