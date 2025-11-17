const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  httpAgentOptions: {
    timeout: 120000,
  },
  images: {
    domains: [
      'images.pexels.com',
      'i.imgur.com',
      'unsplash.com',
      'via.placeholder.com'
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Ignore Deno files during webpack compilation
    config.module.rules.push({
      test: /\.ts$/,
      include: path.resolve(__dirname, 'supabase/functions'),
      use: 'null-loader',
    });

    // Ignore critical dependency warnings from Supabase realtime
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Optimize webpack configuration
    if (dev) {
      config.cache = false; // Disable caching in development to avoid issues
    }

    return config;
  },
  // Ensure proper static generation
  trailingSlash: false,
  // Optimize for production
  swcMinify: true,
  // Handle environment variables properly
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Optimize build performance
  experimental: {
    optimizeCss: false, // Disable to avoid conflicts with critters
  },
  // Improve build performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;