/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    PYTHON_EMBEDDINGS_SERVICE_URL: process.env.PYTHON_EMBEDDINGS_SERVICE_URL,
  }
}

module.exports = nextConfig