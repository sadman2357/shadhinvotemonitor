import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ children, title, description }) {
    const defaultTitle = 'Shadhin Vote Monitor - Civic Election Monitoring'
    const defaultDescription = 'Citizen-powered election monitoring platform for Bangladesh'

    return (
        <>
            <Head>
                <title>{title || defaultTitle}</title>
                <meta name="description" content={description || defaultDescription} />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={title || defaultTitle} />
                <meta property="og:description" content={description || defaultDescription} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    )
}
