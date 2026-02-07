/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Ensure we don't have strict mode causing double renders in dev which might confuse the user
    reactStrictMode: true,
};

export default nextConfig;
