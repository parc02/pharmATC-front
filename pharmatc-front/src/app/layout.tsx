import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <head>
            <title>pharmATC</title>
            <meta name="description" content="약품 호환성 검색 서비스" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            {/* Google Analytics GA4 */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-KG84SED4F3" />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KG84SED4F3');
            `,
                }}
            />
        </head>
        <body>{children}</body>
        </html>
    );
}
