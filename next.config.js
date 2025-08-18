/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
  // Disable static optimization
  trailingSlash: false,
}

module.exports = nextConfig