import type { NextConfig } from 'next';

// Backend dùng chung (metus-zalo-be). Trình duyệt luôn gọi cùng domain /api/cert-shop/*,
// Next chuyển tiếp sang BE nên cookie phiên (httpOnly) hoạt động mà không cần CORS.
const BE_URL = (process.env.BE_URL || 'http://127.0.0.1:4100').replace(/\/$/, '');

const nextConfig: NextConfig = {
  // Trang phụ thuộc cookie đăng nhập nên dùng render động, không dùng Cache Components
  cacheComponents: false,
  async rewrites() {
    return [{ source: '/api/cert-shop/:path*', destination: `${BE_URL}/api/cert-shop/:path*` }];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
