/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['node-pty'],
  allowedDevOrigins: ["100.124.211.47"]
}

module.exports = nextConfig