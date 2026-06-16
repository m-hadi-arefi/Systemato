const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'systemato-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})

const BUCKET = process.env.MINIO_BUCKET || 'systemato-media'
// آدرس داخلی MinIO روی شبکهٔ داکر (به بیرون expose نمی‌شود)
const MINIO_INTERNAL = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`

// host عمومی برای next/image (از روی MINIO_PUBLIC_URL محاسبه می‌شود)
let publicHost = null
try {
  publicHost = process.env.MINIO_PUBLIC_URL ? new URL(process.env.MINIO_PUBLIC_URL) : null
} catch {
  publicHost = null
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      ...(publicHost
        ? [{ protocol: publicHost.protocol.replace(':', ''), hostname: publicHost.hostname, pathname: '/**' }]
        : []),
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
  },
  // پراکسی فایل‌های MinIO از طریق app (تنها پورت ۳۰۰۰ به بیرون باز است)
  async rewrites() {
    return [
      {
        source: `/${BUCKET}/:path*`,
        destination: `${MINIO_INTERNAL}/${BUCKET}/:path*`,
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
