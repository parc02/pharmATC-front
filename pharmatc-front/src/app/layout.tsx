// app/layout.tsx
import './globals.css'; // Tailwind CSS 등 전역 스타일
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'pharmATC',
    description: '약품 호환성 검색 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <body>{children}</body>
        </html>
    );
}
