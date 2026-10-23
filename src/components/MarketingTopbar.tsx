'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LocaleSwitch } from './LanguagePicker';
import { useI18n } from '@/lib/i18n';

/** Topbar trang chủ: dính trên cùng, nền mờ; menu điện thoại là bảng sổ xuống ngay dưới header. */
export default function MarketingTopbar({ loggedIn, username }: { loggedIn: boolean; username: string | null }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const NAV = [
    { href: '/#install', label: t('nav.certificates') },
    { href: '/sign', label: t('nav.signIpa') },
    { href: '/apps', label: t('nav.appStore') },
    { href: '/#guide', label: t('nav.guide') },
    { href: '/#faq', label: t('nav.support') },
  ];
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
              {username ? t('nav.hello', { name: username }) : t('nav.viewAccount')}
            </Link>
          ) : (
            <Link href="/login">{t('nav.login')}</Link>
          )}
          <Link href={loggedIn ? '/dashboard' : '/register'} className="rounded-[9px] bg-deep px-[18px] py-3 text-white hover:bg-deep-dark">
            {loggedIn ? t('nav.viewAccount') : t('nav.register')}
          </Link>
          <LocaleSwitch />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitch />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="marketing-nav"
            className="rounded-lg p-2.5 text-ink"
          >
            <svg viewBox="0 0 24 24" className="icon h-6 w-6">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
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
                {t('nav.viewAccount')}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-[9px] border border-line px-4 py-3 text-center">
                  {t('nav.login')}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1 rounded-[9px] bg-deep px-4 py-3 text-center text-white">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
