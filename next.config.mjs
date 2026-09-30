/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is still run via `npm run lint`; do not fail production builds on warnings.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
