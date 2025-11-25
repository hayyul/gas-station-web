import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are available at runtime
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nfcreaderwriterapi.onrender.com/api/v1',
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'production',
  },
};

export default nextConfig;
