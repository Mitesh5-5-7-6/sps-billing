// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   typedRoutes: true,
//   serverExternalPackages: ["pdfkit"],
//   experimental: {
//     optimizeCss: true,
//   },
//   webpack(config) {
//     config.externals = config.externals || [];
//     config.externals.push({
//       pdfkit: "commonjs pdfkit",
//     });
//     return config;
//   },
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["pdfkit"],
  experimental: {
    // Disable CSS optimization to avoid critters dependency issues
    optimizeCss: false,
  },
  webpack(config) {
    config.externals = config.externals || [];
    config.externals.push({
      pdfkit: "commonjs pdfkit",
      canvas: "commonjs canvas",
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
  output: 'standalone',
};

export default nextConfig;