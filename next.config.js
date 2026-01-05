/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 🚫 pdfjs tries to load node-canvas — block it
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
