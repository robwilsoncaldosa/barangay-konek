import type { NextConfig } from "next";
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX({
  // customise the config file path
  configPath: "src/lib/source.config.ts"
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude blockchain folder from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/blockchain/**', '**/node_modules/**']
    };
    
    return config;
  },
};

export default withMDX(nextConfig);