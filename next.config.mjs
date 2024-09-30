/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '',
                port: '',
                pathname: '/api/v1/image/**',
            },
        ],
    },
};

export default nextConfig;
