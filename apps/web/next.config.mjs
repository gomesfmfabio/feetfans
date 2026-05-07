/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Skip type checking during build (we do it separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['localhost', 'kyuojnabfherpqmgrmol.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
