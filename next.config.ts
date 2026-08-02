import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disables the SWC rust worker crash triggers in constrained environments
  swcMinify: false,
};

export default nextConfig;
