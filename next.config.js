/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  }
}

module.exports = nextConfig