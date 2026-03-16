/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '100mb',
        },
    },
    transpilePackages: ['three'],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "d7qkkiy9wjm6s.cloudfront.net",
                pathname: "**"
            }
        ]
    }
};

export default nextConfig;
