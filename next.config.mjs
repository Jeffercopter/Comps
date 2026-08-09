/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The SAG mill simulator is a static file staged into public/mill by
  // scripts/stage-mill.mjs. Next serves public assets by exact path, so /mill
  // alone would 404 without this.
  async rewrites() {
    return [{ source: '/mill', destination: '/mill/index.html' }]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
