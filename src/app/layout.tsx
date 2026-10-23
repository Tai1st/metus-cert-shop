import type { Metadata } from 'next';
import Link from 'next/link';
import { Be_Vietnam_Pro } from 'next/font/google';
import { getMe } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';
import './globals.css';

const font = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Metus Browser: cài đặt trên iPhone',
  description: 'Mua chứng chỉ và cài Metus Browser trên iPhone, iPad',
};

const NAV = [
  { href: '/#install', label: 'Tải ứng dụng' },
  { href: '/#guide', label: 'Hướng dẫn cài đặt' },
  { href: '/#faq', label: 'Câu hỏi thường gặp' },
];

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await getMe();
  return (
    <html lang="vi" className={`${font.variable} h-full scroll-smooth antialiased`}>
      <body className="flex min-h-full flex-col text-[14px]">
        <header className="border-b border-line">
          <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:h-[88px] sm:px-9">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight sm:text-[23px]">
              <span className="grid h-[37px] w-[37px] place-items-center rounded-[11px] bg-ink text-2xl font-extrabold italic text-mint">
                m
              </span>
              metus
              <span className="hidden text-[15px] font-normal tracking-tight text-[#7d897d] sm:inline">/ browser</span>
            </Link>

            <nav className="hidden gap-8 text-[13px] text-[#77817e] md:flex">
              {NAV.map((n, i) => (
                <Link key={n.href} href={n.href} className={i === 0 ? 'font-bold text-ink' : 'hover:text-ink'}>
                  {n.label}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link href="/admin" className="font-semibold text-accent">
                  Quản lý
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/orders"
                className="hidden rounded-[10px] border border-[#d8dfd9] px-4 py-3 hover:bg-[#edf2e9] lg:inline-block"
              >
                Tra cứu đơn hàng ↗
              </Link>
              {user ? (
                <>
                  <span className="hidden max-w-[120px] truncate px-2 font-semibold sm:inline">{user.username}</span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="px-2 py-3 font-semibold">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="rounded-[10px] bg-ink px-4 py-3 text-white hover:bg-ink-dark">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1210px] flex-1 px-5 py-8 sm:px-9 sm:py-12">{children}</main>

        <footer className="mx-auto w-full max-w-[1140px] border-t border-line px-5 py-6 text-[10px] text-[#8b948a]">
          <div className="flex flex-wrap justify-between gap-3">
            <span>© {new Date().getFullYear()} Metus. Thiết kế cho trải nghiệm của bạn.</span>
            <span>
              Metus Browser / iOS installation ·{' '}
              <a href="https://t.me/metusvn" target="_blank" rel="noreferrer" className="underline">
                Hỗ trợ Telegram
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
