import '../styles/globals.css'
import { appWithTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
    const router = useRouter()
    const { locale } = router

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#b71c1c" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div lang={locale}>
                <Component {...pageProps} />
            </div>
        </>
    )
}

export default appWithTranslation(MyApp)
