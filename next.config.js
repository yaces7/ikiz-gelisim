/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ikiz-gelisim.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'ikiz-gelisim.onrender.com',
      },
    ],
  },
}

module.exports = nextConfig
