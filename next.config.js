/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
  // Disable static optimization
  trailingSlash: false,
  // Ensure no static generation
  generateStaticParams: false,
  // Force dynamic routes
  dynamicParams: true,
}

module.exports = nextConfig