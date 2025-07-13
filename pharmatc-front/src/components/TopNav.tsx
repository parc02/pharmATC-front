'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNav() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-b px-6 py-4 flex items-center space-x-6">
            <h1 className="font-bold text-xl text-black">pharmATC</h1>

            <Link
                href="/search"
                className={`font-semibold ${
                    pathname === '/search'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-black'
                }`}
            >
                호환 카세트 검색
            </Link>

            <Link
                href="/myDrugs"
                className={`font-semibold ${
                    pathname === '/myDrugs'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-black'
                }`}
            >
                내 카세트 관리
            </Link>
        </nav>
    );
}
