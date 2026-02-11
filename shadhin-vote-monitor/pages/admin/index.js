import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { bangladeshData, getDistricts } from '../../data/bangladesh-data'

export default function AdminDashboard() {
    const { t } = useTranslation('common')
    const router = useRouter()

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loginForm, setLoginForm] = useState({ username: '', password: '' })
    const [loginError, setLoginError] = useState(null)
    const [loginLoading, setLoginLoading] = useState(false)

    const [reports, setReports] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        district: 'all',
        constituency: 'all',
        status: 'under_review',
        search: ''
    })
    const [constituencies, setConstituencies] = useState([])
    const [selectedReport, setSelectedReport] = useState(null)

    const districts = getDistricts()

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (token) {
            setIsAuthenticated(true)
            fetchReports()
        }
    }, [])

    // Update constituencies when district changes
    useEffect(() => {
        if (filters.district && filters.district !== 'all') {
            setConstituencies(bangladeshData[filters.district] || [])
            setFilters(prev => ({ ...prev, constituency: 'all' }))
        } else {
            setConstituencies([])
        }
    }, [filters.district])

    // Fetch reports when filters change
    useEffect(() => {
        if (isAuthenticated) {
            fetchReports()
        }
    }, [filters, isAuthenticated])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoginError(null)
        setLoginLoading(true)

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginForm)
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('adminToken', data.token)
                localStorage.setItem('adminUser', JSON.stringify(data.admin))
                setIsAuthenticated(true)
                fetchReports()
            } else {
                setLoginError(data.message || t('i18n.language') === 'bn'
                    ? 'লগইন ব্যর্থ'
                    : 'Login failed'
                )
            }
        } catch (err) {
            console.error('Login error:', err)
            setLoginError(t('i18n.language') === 'bn'
                ? 'লগইন ব্যর্থ'
                : 'Login failed'
            )
        } finally {
            setLoginLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setIsAuthenticated(false)
        setReports([])
        setStats(null)
    }

    const fetchReports = async () => {
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('adminToken')
            const params = new URLSearchParams({
                page: '1',
                limit: '100'
            })

            if (filters.status !== 'all') {
                params.append('status', filters.status)
            }
            if (filters.district !== 'all') {
                params.append('district', filters.district)
            }
            if (filters.constituency !== 'all') {
                params.append('constituency', filters.constituency)
            }
            if (filters.search) {
                params.append('search', filters.search)
            }

            const response = await fetch(`/api/admin/reports?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                setReports(data.data)
                setStats(data.stats)
            } else {
                if (response.status === 401) {
                    handleLogout()
                }
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

    const handleAction = async (reportId, action) => {
        const confirmMessages = {
            approve: t('admin.confirmApprove'),
            reject: t('admin.confirmReject'),
            delete: t('admin.confirmDelete')
        }

        if (!confirm(confirmMessages[action])) {
            return
        }

        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch('/api/admin/reports', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reportId, action })
            })

            const data = await response.json()

            if (response.ok) {
                // Refresh reports
                fetchReports()
                setSelectedReport(null)
            } else {
                alert(data.message || t('i18n.language') === 'bn'
                    ? 'অপারেশন ব্যর্থ'
                    : 'Operation failed'
                )
            }
        } catch (err) {
            console.error('Action error:', err)
            alert(t('i18n.language') === 'bn'
                ? 'অপারেশন ব্যর্থ'
                : 'Operation failed'
            )
        }
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

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <Layout
                title={`${t('admin.login')} - ${t('common.appName')}`}
                description="Admin login"
            >
                <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12">
                    <div className="card p-8 w-full max-w-md">
                        <h1 className="text-3xl font-bold text-center text-neutral-900 mb-6">
                            🔒 {t('admin.login')}
                        </h1>

                        {loginError && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                <p className="text-red-800 font-medium">✗ {loginError}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block font-semibold text-neutral-900 mb-2">
                                    {t('admin.username')}
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                    className="input-field"
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block font-semibold text-neutral-900 mb-2">
                                    {t('admin.password')}
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                    className="input-field"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full"
                                disabled={loginLoading}
                            >
                                {loginLoading ? t('common.loading') : t('admin.loginButton')}
                            </button>
                        </form>
                    </div>
                </div>
            </Layout>
        )
    }

    // Dashboard Screen
    return (
        <Layout
            title={`${t('admin.dashboard')} - ${t('common.appName')}`}
            description="Admin dashboard"
        >
            <div className="section-container py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">{t('admin.dashboard')}</h1>
                    <button onClick={handleLogout} className="btn-outline">
                        {t('admin.logout')}
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid md:grid-cols-4 gap-4 mb-8">
                        <div className="card p-6">
                            <div className="text-3xl font-bold text-neutral-900">{stats.total}</div>
                            <div className="text-neutral-600">{t('admin.allReports')}</div>
                        </div>
                        <div className="card p-6">
                            <div className="text-3xl font-bold text-yellow-600">{stats.under_review}</div>
                            <div className="text-neutral-600">{t('admin.pendingReview')}</div>
                        </div>
                        <div className="card p-6">
                            <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
                            <div className="text-neutral-600">{t('admin.verified')}</div>
                        </div>
                        <div className="card p-6">
                            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-neutral-600">{t('admin.rejected')}</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card p-6 mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block font-semibold text-neutral-900 mb-2">
                                {t('incidents.status')}
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="input-field"
                            >
                                <option value="all">{t('admin.allReports')}</option>
                                <option value="under_review">{t('admin.pendingReview')}</option>
                                <option value="verified">{t('admin.verified')}</option>
                                <option value="rejected">{t('admin.rejected')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-neutral-900 mb-2">
                                {t('report.district')}
                            </label>
                            <select
                                value={filters.district}
                                onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                                className="input-field"
                            >
                                <option value="all">{t('incidents.allDistricts')}</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-neutral-900 mb-2">
                                {t('report.constituency')}
                            </label>
                            <select
                                value={filters.constituency}
                                onChange={(e) => setFilters(prev => ({ ...prev, constituency: e.target.value }))}
                                className="input-field"
                                disabled={filters.district === 'all'}
                            >
                                <option value="all">{t('incidents.allConstituencies')}</option>
                                {constituencies.map(constituency => (
                                    <option key={constituency} value={constituency}>{constituency}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-neutral-900 mb-2">
                                {t('admin.search')}
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder={t('admin.searchPlaceholder')}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                        <p className="text-red-800 font-medium">✗ {error}</p>
                    </div>
                )}

                {/* Reports Table */}
                {!loading && !error && (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">{t('report.district')}</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">{t('report.constituency')}</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">{t('report.votingCenter')}</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">{t('incidents.status')}</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">{t('admin.uploadTime')}</th>
                                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-neutral-600">
                                                {t('incidents.noReports')}
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((report) => (
                                            <tr key={report.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                                                <td className="px-4 py-3 text-sm font-mono">{report.id.substring(0, 8)}...</td>
                                                <td className="px-4 py-3">{report.district}</td>
                                                <td className="px-4 py-3">{report.constituency}</td>
                                                <td className="px-4 py-3">{report.voting_center_number}</td>
                                                <td className="px-4 py-3">
                                                    <span className={
                                                        report.status === 'verified' ? 'badge-verified' :
                                                            report.status === 'rejected' ? 'badge-rejected' :
                                                                'badge-under-review'
                                                    }>
                                                        {t(`incidents.status.${report.status}`)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{formatDate(report.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setSelectedReport(report)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                        >
                                                            {t('i18n.language') === 'bn' ? 'দেখুন' : 'View'}
                                                        </button>
                                                        {report.status === 'under_review' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(report.id, 'approve')}
                                                                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                                >
                                                                    {t('admin.approve')}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(report.id, 'reject')}
                                                                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                                >
                                                                    {t('admin.reject')}
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleAction(report.id, 'delete')}
                                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                        >
                                                            {t('admin.delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Report Detail Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
                        <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-neutral-900">{t('i18n.language') === 'bn' ? 'রিপোর্ট বিস্তারিত' : 'Report Details'}</h2>
                                    <button onClick={() => setSelectedReport(null)} className="text-neutral-600 hover:text-neutral-900 text-2xl">
                                        ×
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        {selectedReport.media_type.startsWith('image/') ? (
                                            <img src={selectedReport.media_url} alt="Report" className="w-full rounded-lg" />
                                        ) : (
                                            <video src={selectedReport.media_url} controls className="w-full rounded-lg" />
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 mb-1">{t('report.district')}</h3>
                                            <p className="text-neutral-700">{selectedReport.district}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 mb-1">{t('report.constituency')}</h3>
                                            <p className="text-neutral-700">{selectedReport.constituency}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 mb-1">{t('report.votingCenter')}</h3>
                                            <p className="text-neutral-700">{selectedReport.voting_center_number}</p>
                                        </div>
                                        {selectedReport.description && (
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 mb-1">{t('report.description')}</h3>
                                                <p className="text-neutral-700">{selectedReport.description}</p>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 mb-1">{t('admin.metadata')}</h3>
                                            <div className="text-sm text-neutral-700 space-y-1">
                                                <p><strong>{t('admin.fileSize')}:</strong> {formatFileSize(selectedReport.file_size_bytes)}</p>
                                                <p><strong>{t('admin.uploadTime')}:</strong> {formatDate(selectedReport.created_at)}</p>
                                                <p><strong>{t('admin.ipHash')}:</strong> {selectedReport.ip_hash.substring(0, 16)}...</p>
                                                {selectedReport.gps_latitude && selectedReport.gps_longitude && (
                                                    <p><strong>GPS:</strong> {selectedReport.gps_latitude}, {selectedReport.gps_longitude}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            {selectedReport.status === 'under_review' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            handleAction(selectedReport.id, 'approve')
                                                            setSelectedReport(null)
                                                        }}
                                                        className="btn-secondary flex-1"
                                                    >
                                                        {t('admin.approve')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleAction(selectedReport.id, 'reject')
                                                            setSelectedReport(null)
                                                        }}
                                                        className="btn-outline flex-1"
                                                    >
                                                        {t('admin.reject')}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    handleAction(selectedReport.id, 'delete')
                                                    setSelectedReport(null)
                                                }}
                                                className="btn-outline border-red-600 text-red-600 hover:bg-red-600"
                                            >
                                                {t('admin.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
