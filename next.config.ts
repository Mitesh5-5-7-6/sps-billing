import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdfkit/js/data": require.resolve("pdfkit/js/data"),
      };
    }
    return config;
  },
  experimental: {
    typedRoutes: true,
    optimizeCss: true,
    serverComponentsExternalPackages: ["pdfkit"],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
