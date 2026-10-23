'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';

const ITEMS = [
  { href: '/#install', label: 'Mua chứng chỉ', match: (p: string) => p === '/' },
  { href: '/sign', label: 'Ký IPA', match: (p: string) => p.startsWith('/sign') },
  { href: '/apps', label: 'Kho ứng dụng', match: (p: string) => p.startsWith('/apps') },
  { href: '/check', label: 'Kiểm tra chứng chỉ', match: (p: string) => p.startsWith('/check') },
  { href: '/lookup', label: 'Tìm đơn hàng', match: (p: string) => p.startsWith('/lookup') },
  { href: '/#guide', label: 'Hướng dẫn', match: () => false },
];

/** Thanh menu dạng viên thuốc cho màn hình rộng, đánh dấu trang đang mở. */
export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 rounded-full border border-line bg-white p-1.5 text-[13px] shadow-[0_2px_12px_#1428280a] lg:flex">
      {ITEMS.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`whitespace-nowrap rounded-full px-4 py-2 transition ${
            n.match(path) ? 'bg-[#eef1ec] font-semibold text-ink' : 'text-[#6c7a77] hover:bg-[#f4f6f3] hover:text-ink'
          }`}
        >
          {n.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className={`whitespace-nowrap rounded-full px-4 py-2 font-semibold text-accent ${path.startsWith('/admin') ? 'bg-tint' : 'hover:bg-tint'}`}
        >
          Quản lý
        </Link>
      )}
    </nav>
  );
}

/** Menu cho điện thoại và máy tính bảng: nút ba gạch mở bảng liên kết, kèm đăng nhập/đăng xuất. */
export function MobileMenu({ isAdmin, username }: { isAdmin: boolean; username: string | null }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Chuyển trang thì đóng menu; Esc cũng đóng; mở menu thì khóa cuộn nền.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const link = 'block rounded-xl px-4 py-3 text-[15px] hover:bg-[#f4f6f3]';
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-lg shadow-[0_2px_12px_#1428280a]"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <>
          {/* Lớp mờ phía dưới: bấm vào để đóng */}
          <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 bg-[#0c202655] sm:top-[88px]" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-3 top-[80px] z-50 max-h-[calc(100vh-96px)] overflow-y-auto rounded-3xl border border-line bg-white p-3 shadow-[0_20px_60px_#0003] sm:top-[96px] sm:max-h-[calc(100vh-112px)]">
            {ITEMS.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`${link} ${n.match(path) ? 'bg-[#eef1ec] font-semibold' : ''}`}>
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className={`${link} font-semibold text-accent`}>
                Quản lý
              </Link>
            )}
            <div className="mt-2 border-t border-line pt-2">
              {username ? (
                <>
                  <Link href="/orders" onClick={() => setOpen(false)} className={link}>
                    Đơn của tôi <span className="text-muted">· {username}</span>
                  </Link>
                  <div className="px-4 py-3 text-[15px]">
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-1">
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-[#d8dfd9] py-3 text-center text-sm font-semibold">
                    Đăng nhập
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="rounded-full bg-ink py-3 text-center text-sm font-semibold text-white">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
