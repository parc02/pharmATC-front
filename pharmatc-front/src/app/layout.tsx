import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'pharmATC',
    description: '약품 호환성 검색 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <head>
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
