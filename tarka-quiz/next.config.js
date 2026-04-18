/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/QuizMultiuser' : '',
  assetPrefix: isProd ? '/QuizMultiuser/' : '',
  trailingSlash: true,
};

module.exports = nextConfig;