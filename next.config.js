/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // PDF.js fix
    config.resolve.alias.canvas = false;

    // 🚫 Do NOT bundle Node-only Genkit deps
    if (!isServer) {
      config.resolve.alias["@genkit-ai"] = false;
      config.resolve.alias["@opentelemetry"] = false;
      config.resolve.alias["express"] = false;
    }

    return config;
  },
};

module.exports = nextConfig;
