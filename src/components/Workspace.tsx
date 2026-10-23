'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Use } from './IconSprite';
import LogoutButton from './LogoutButton';

const NAV = [
  { key: 'dashboard', href: '/dashboard', icon: 'i-dashboard', label: 'Tổng quan' },
  { key: 'orders', href: '/orders', icon: 'i-orders', label: 'Đơn hàng của tôi' },
  { key: 'sign', href: '/sign', icon: 'i-sign', label: 'Ký ứng dụng IPA' },
  { key: 'apps', href: '/apps', icon: 'i-apps', label: 'Kho ứng dụng' },
  { key: 'check', href: '/check', icon: 'i-check', label: 'Kiểm tra chứng chỉ' },
  { key: 'lookup', href: '/lookup', icon: 'i-lookup', label: 'Tìm đơn hàng' },
] as const;

const TITLES: Record<string, string> = {
  dashboard: 'Tổng quan',
  orders: 'Đơn hàng của tôi',
  sign: 'Ký ứng dụng IPA',
  apps: 'Kho ứng dụng',
  check: 'Kiểm tra chứng chỉ',
  lookup: 'Tìm đơn hàng',
  admin: 'Quản lý',
};

/** Khung "Không gian của bạn": thanh bên cố định + topbar, dùng cho mọi trang trong tài khoản. */
export default function Workspace({
  user,
  isAdmin,
  children,
}: {
  user: { username: string } | null;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = path.split('/').filter(Boolean)[0] || 'dashboard';
  const title = TITLES[current] || 'Không gian của bạn';

  useEffect(() => setOpen(false), [path]);

  return (
    <div>
      {open && <div className="fixed inset-0 z-[5] bg-[#18321d60] lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-[6] flex w-[226px] flex-col border-r border-line bg-white p-[18px] pt-[30px] transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href="/" className="mx-3 mb-[43px] flex items-center gap-2.5 text-[22px] font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-[25px] font-extrabold italic leading-none text-lime">m</span>
          <span>
            metus
            <small className="mt-0.5 block text-[7px] font-medium tracking-[2px] text-[#8a9681]">WORKSPACE</small>
          </span>
        </Link>

        <div className="mb-3 ml-[15px] text-[8px] tracking-[1.5px] text-[#a1ab96]">KHÔNG GIAN CỦA BẠN</div>
        <nav className="grid gap-[5px]">
          {NAV.map((n) => {
            const active = current === n.key;
            return (
              <Link
                key={n.key}
                href={n.href}
                className={`flex items-center gap-3 rounded-[9px] px-[15px] py-[13px] text-[11px] ${
                  active ? 'bg-[#ecf4e1] font-semibold text-[#355b20]' : 'text-[#7f8c75] hover:bg-[#f2f6ec]'
                }`}
              >
                <Use id={n.icon} className="icon h-[17px] w-[17px]" />
                {n.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-[9px] px-[15px] py-[13px] text-[11px] ${
                current === 'admin' ? 'bg-[#ecf4e1] font-semibold text-[#355b20]' : 'text-[#7f8c75] hover:bg-[#f2f6ec]'
              }`}
            >
              <Use id="i-lock" className="icon h-[17px] w-[17px]" />
              Quản lý
            </Link>
          )}
        </nav>

        <div className="mb-[17px] mt-auto rounded-[13px] border border-line bg-[#f5f8ef] p-[17px]">
          <strong className="text-[11px]">Cần một chút hỗ trợ?</strong>
          <p className="my-2 text-[9px] leading-[1.8] text-[#8c987e]">Metus luôn sẵn sàng giúp bạn cài đặt và sử dụng.</p>
          <a href="https://t.me/metusvn" target="_blank" rel="noreferrer" className="flex justify-between text-[10px] font-semibold">
            Nhắn qua Telegram <span>↗</span>
          </a>
        </div>
        <Link href="/" className="flex items-center gap-2.5 border-t border-line px-3 pt-5 text-[10px] text-[#8e9a80]">
          ← &nbsp; Quay lại cửa hàng
        </Link>
      </aside>

      <div className="lg:ml-[226px]">
        <header className="flex h-[72px] items-center justify-between gap-4 border-b border-line bg-white/85 px-[22px] backdrop-blur sm:h-[83px] sm:px-9">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở menu"
            className="rounded-lg border border-line bg-white p-[7px] lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="icon h-5 w-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3 text-[10px] text-[#97a18c]">
            <span className="hidden sm:inline">Không gian của bạn</span>
            <span className="hidden sm:inline">/</span>
            <b className="font-medium text-[#526349]">{title}</b>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-2.5 text-[10px] sm:flex">
                  <div className="grid h-[31px] w-[31px] place-items-center rounded-full bg-[#e4edda] text-[10px] font-bold text-[#627e44]">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span>{user.username}</span>
                </div>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="rounded-[9px] bg-deep px-4 py-2.5 text-[11px] font-semibold text-white">
                Đăng nhập
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1370px] px-[22px] py-[30px] sm:px-9">
          {children}
          <footer className="mt-8 flex justify-between border-t border-line pt-[18px] text-[8px] text-[#a1ac95]">
            <span>© {new Date().getFullYear()} Metus · Thiết kế cho trải nghiệm của bạn.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
