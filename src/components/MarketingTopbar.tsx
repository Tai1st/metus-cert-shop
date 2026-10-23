'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { href: '/#install', label: 'Chứng chỉ iOS' },
  { href: '/sign', label: 'Ký IPA' },
  { href: '/apps', label: 'Kho ứng dụng' },
  { href: '/#guide', label: 'Hướng dẫn' },
  { href: '/#faq', label: 'Hỗ trợ' },
];

/** Topbar trang chủ: dính trên cùng, nền mờ; menu điện thoại là bảng sổ xuống ngay dưới header. */
export default function MarketingTopbar({ loggedIn, username }: { loggedIn: boolean; username: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-0 z-[5] border-b border-line bg-paper/95 backdrop-blur-xl">
      <header className="mx-auto flex h-[78px] max-w-[1220px] items-center justify-between gap-3 px-6 sm:h-[88px] sm:px-9">
        <Link href="/" className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-tight sm:text-[25px]" aria-label="Metus trang chủ">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-[25px] font-extrabold italic leading-none text-lime sm:h-10 sm:w-10 sm:text-[29px]">
            m
          </span>
          <span>
            metus
            <small className="mt-0.5 block text-[7px] font-medium tracking-[2.2px] text-[#7e897f] sm:text-[8px]">APP STORE</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-[27px] text-[11px] text-[#748077] md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 text-[11px] font-semibold md:flex">
          {loggedIn ? (
            <Link href="/dashboard" className="truncate">
              {username ? `Xin chào, ${username}` : 'Xem tài khoản'}
            </Link>
          ) : (
            <Link href="/login">Đăng nhập</Link>
          )}
          <Link href={loggedIn ? '/dashboard' : '/register'} className="rounded-[9px] bg-deep px-[18px] py-3 text-white hover:bg-deep-dark">
            {loggedIn ? 'Xem tài khoản' : 'Đăng ký'}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          aria-controls="marketing-nav"
          className="rounded-lg p-2.5 text-ink md:hidden"
        >
          <svg viewBox="0 0 24 24" className="icon h-6 w-6">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {open && (
        <nav
          id="marketing-nav"
          className="absolute inset-x-5 top-[72px] z-10 flex flex-col gap-[22px] rounded-2xl border border-line bg-white p-[22px] text-[13px] shadow-[0_15px_40px_#18302015] md:hidden"
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <div className="flex gap-3 border-t border-line pt-[22px]">
            {loggedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex-1 rounded-[9px] bg-deep px-4 py-3 text-center text-white">
                Xem tài khoản
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-[9px] border border-line px-4 py-3 text-center">
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1 rounded-[9px] bg-deep px-4 py-3 text-center text-white">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
