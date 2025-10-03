/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  // Support importing audio files
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|flac)$/i,
      type: 'asset/resource',
    });
    return config;
  },
}

module.exports = nextConfig
