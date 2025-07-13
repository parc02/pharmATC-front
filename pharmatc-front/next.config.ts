import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        domains: [
            'pharmatc-backend-production.up.railway.app',
            'nedrug.mfds.go.kr', // 약 이미지 실제 도메인 추가
        ],
    },
}

export default nextConfig