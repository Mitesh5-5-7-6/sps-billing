import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["pdfkit"],
  experimental: {
    optimizeCss: true,
  },
  webpack(config) {
    config.externals = config.externals || [];
    config.externals.push({
      pdfkit: "commonjs pdfkit",
    });
    return config;
  },
};

export default nextConfig;
