# Triển khai FE shop chứng chỉ

FE Next.js (cổng 3002) chạy cùng VPS với BE dùng chung `metus-zalo-be` (cổng 4100). Tên miền: `appstore.metus.vn`.

Trình duyệt chỉ gọi `appstore.metus.vn/api/cert-shop/*`; Next chuyển tiếp sang `BE_URL` (nội bộ `127.0.0.1:4100`).
Hồ sơ UDID của iPhone và webhook chungchi.store cũng đi qua đường này.

## Đã thiết lập sẵn trên VPS
- Vhost nginx `/etc/nginx/sites-available/metus-cert-shop` (bản gốc: `deploy/nginx/appstore.metus.vn.conf`), có đọc IP thật qua Cloudflare.
- Chứng chỉ HTTPS Let's Encrypt cho `appstore.metus.vn` (certbot tự gia hạn).

## Cài đặt một lần
```bash
# 1. Swap 2GB để build Next.js không hết RAM (VPS chưa có swap)
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. Deploy key riêng cho repo (thêm khóa .pub vào GitHub: Settings > Deploy keys, chỉ đọc)
ssh-keygen -t ed25519 -N '' -f /root/.ssh/id_ed25519_github_cert
cat >> /root/.ssh/config <<'EOF'

Host github-cert
    HostName github.com
    User git
    IdentityFile /root/.ssh/id_ed25519_github_cert
    IdentitiesOnly yes
EOF

# 3. Lấy code, build, chạy
git clone git@github-cert:Tai1st/metus-cert-shop.git /var/www/metus-cert-shop
cd /var/www/metus-cert-shop
npm ci && npm run build
pm2 start ecosystem.config.js && pm2 save
```

## Tự động deploy
Push lên `main` chạy `.github/workflows/deploy.yml`: build thử, SSH vào VPS, `git pull`, build, `pm2 reload`, kiểm tra sức khỏe và tự rollback nếu lỗi.
Cần đặt 4 secret cho repo (cùng giá trị với các repo Zalo): `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`.

## Cấu hình sau khi chạy
Đăng nhập bằng tài khoản Admin của Zalo, vào **Quản lý > Cài đặt**:
- URL công khai của shop: `https://appstore.metus.vn`
- Ngân hàng nhận tiền, hệ số giá
- API key và webhook secret chungchi.store

Webhook chungchi.store: `https://appstore.metus.vn/api/cert-shop/webhooks/chungchi`
