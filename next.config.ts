import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.20.112.1'],
  serverExternalPackages: ['@prisma/client', 'prisma'],
  turbopack: {},
};

export default nextConfig;