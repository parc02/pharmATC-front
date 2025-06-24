/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        domains: ['pharmatc-backend-production.up.railway.app'], // 여기에 실제 이미지 도메인 추가
    },
};

export default nextConfig;
