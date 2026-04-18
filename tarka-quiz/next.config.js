/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/QuizMultiuser',
  assetPrefix: '/QuizMultiuser/',
  trailingSlash: true,
};

module.exports = nextConfig;