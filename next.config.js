/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Force all API routes to be serverless functions
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },

  // Ensure API routes work correctly
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  images: {
    domains: ['localhost', 'ikiz-gelisim.vercel.app', 'ikiz-gelisim.onrender.com'],
  },
}

module.exports = nextConfig
