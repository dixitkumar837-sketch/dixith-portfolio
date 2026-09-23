/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@huggingface/transformers', 'onnxruntime-node'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/case-studies',
        destination: '/professional-experience',
        permanent: true,
      },
      {
        source: '/case-studies/healthcare-discovery-architecture',
        destination: '/professional-experience/healthcare-search-architecture',
        permanent: true,
      },
      {
        source: '/case-studies/enterprise-search-infrastructure',
        destination: '/professional-experience/international-search-architecture',
        permanent: true,
      },
      {
        source: '/case-studies/ecommerce-generative-optimization',
        destination: '/professional-experience/ecommerce-search-generative-discovery',
        permanent: true,
      },
      {
        source: '/case-studies/:slug*',
        destination: '/professional-experience',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
