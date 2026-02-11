import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { bangladeshData, getDistricts } from '../data/bangladesh-data'

export default function IncidentsPage() {
    const { t } = useTranslation('common')

    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        district: 'all',
        constituency: 'all',
        sortBy: 'latest'
    })
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [constituencies, setConstituencies] = useState([])

    const districts = getDistricts()

    // Update constituencies when district changes
    useEffect(() => {
        if (filters.district && filters.district !== 'all') {
            setConstituencies(bangladeshData[filters.district] || [])
            setFilters(prev => ({ ...prev, constituency: 'all' }))
        } else {
            setConstituencies([])
        }
    }, [filters.district])

    // Fetch reports
    useEffect(() => {
        fetchReports()
    }, [filters, page])

    const fetchReports = async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                status: 'verified',
                page: page.toString(),
                limit: '20',
                sortBy: filters.sortBy
            })

            if (filters.district !== 'all') {
                params.append('district', filters.district)
            }

            if (filters.constituency !== 'all') {
                params.append('constituency', filters.constituency)
            }

            const response = await fetch(`/api/reports/list?${params}`)
            const data = await response.json()

            if (response.ok) {
                setReports(data.data)
                setPagination(data.pagination)
            } else {
                setError(data.message || t('i18n.language') === 'bn'
                    ? 'রিপোর্ট লোড করতে ব্যর্থ'
                    : 'Failed to load reports'
                )
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError(t('i18n.language') === 'bn'
                ? 'রিপোর্ট লোড করতে ব্যর্থ'
                : 'Failed to load reports'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
        setPage(1) // Reset to first page
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString(t('i18n.language') === 'bn' ? 'bn-BD' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'verified':
                return 'badge-verified'
            case 'under_review':
                return 'badge-under-review'
            case 'rejected':
                return 'badge-rejected'
            default:
                return 'badge-under-review'
        }
    }

    return (
        <Layout
            title={`${t('incidents.title')} - ${t('common.appName')}`}
            description={t('incidents.subtitle')}
        >
            <div className="section-container py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="page-title">{t('incidents.title')}</h1>
                    <p className="page-subtitle">{t('incidents.subtitle')}</p>
                </div>

                {/* Filters */}
                <div className="card p-6 mb-8">
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* District Filter */}
                        <div>
                            <label htmlFor="district" className="block font-semibold text-neutral-900 mb-2">
                                {t('incidents.filterByDistrict')}
                            </label>
                            <select
                                id="district"
                                name="district"
                                value={filters.district}
                                onChange={handleFilterChange}
                                className="input-field"
                            >
                                <option value="all">{t('incidents.allDistricts')}</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Constituency Filter */}
                        <div>
                            <label htmlFor="constituency" className="block font-semibold text-neutral-900 mb-2">
                                {t('incidents.filterByConstituency')}
                            </label>
                            <select
                                id="constituency"
                                name="constituency"
                                value={filters.constituency}
                                onChange={handleFilterChange}
                                className="input-field"
                                disabled={filters.district === 'all'}
                            >
                                <option value="all">{t('incidents.allConstituencies')}</option>
                                {constituencies.map(constituency => (
                                    <option key={constituency} value={constituency}>{constituency}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label htmlFor="sortBy" className="block font-semibold text-neutral-900 mb-2">
                                {t('incidents.sortBy')}
                            </label>
                            <select
                                id="sortBy"
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleFilterChange}
                                className="input-field"
                            >
                                <option value="latest">{t('incidents.latest')}</option>
                                <option value="oldest">{t('incidents.oldest')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                        <p className="text-red-800 font-medium">✗ {error}</p>
                    </div>
                )}

                {/* Reports Grid */}
                {!loading && !error && (
                    <>
                        {reports.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-xl text-neutral-600">{t('incidents.noReports')}</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {reports.map((report) => (
                                    <div key={report.id} className="card animate-fade-in">
                                        {/* Media */}
                                        <div className="relative aspect-video bg-neutral-200">
                                            {report.media_type.startsWith('image/') ? (
                                                <img
                                                    src={report.media_thumbnail_url || report.media_url}
                                                    alt="Report media"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <video
                                                    src={report.media_url}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                />
                                            )}

                                            {/* Watermark */}
                                            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                {t('incidents.watermark')}
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-2 right-2">
                                                <span className={getStatusBadgeClass(report.status)}>
                                                    {t(`incidents.status.${report.status}`)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-neutral-900">
                                                        {report.district}
                                                    </h3>
                                                    <p className="text-neutral-600">{report.constituency}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-sm text-neutral-700">
                                                <p>
                                                    <span className="font-semibold">{t('incidents.votingCenter')}:</span>{' '}
                                                    {report.voting_center_number}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">{t('incidents.reportedAt')}:</span>{' '}
                                                    {formatDate(report.created_at)}
                                                </p>
                                            </div>

                                            {report.description && (
                                                <p className="mt-3 text-neutral-700 text-sm line-clamp-3">
                                                    {report.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPreviousPage}
                                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← {t('i18n.language') === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                                </button>

                                <span className="text-neutral-700">
                                    {t('i18n.language') === 'bn' ? 'পৃষ্ঠা' : 'Page'} {pagination.currentPage} / {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('i18n.language') === 'bn' ? 'পরবর্তী' : 'Next'} →
                                </button>
                            </div>
                        )}
                    </>
                )}
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
