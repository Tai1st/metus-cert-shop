// PM2: chạy FE shop chứng chỉ ở cổng 3002 (3000 và 3001 đã dành cho FE/admin của Zalo).
module.exports = {
  apps: [
    {
      name: 'metus-cert-shop',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        // BE dùng chung (metus-zalo-be) chạy cùng máy nên đi nội bộ, không qua nginx
        BE_URL: 'http://127.0.0.1:4100',
      },
      max_memory_restart: '600M',
    },
  ],
};
