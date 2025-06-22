import type {NextConfig} from 'next';

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'geminiWrapper';

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: isProd ? `/${repoName}/` : '',
  basePath: isProd ? `/${repoName}` : '',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    allowedDevOrigins: ['*.cloudworkstations.dev'],
  },
};

export default nextConfig;
