import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist } from 'next/font/google';
import { getMe } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';
import './globals.css';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Metus Cert Shop',
  description: 'Mua chứng chỉ ký app iOS để cài Metus Browser trên iPhone, iPad',
};

const NAV = [
  { href: '/buy', label: 'Mua chứng chỉ' },
  { href: '/#huong-dan', label: 'Hướng dẫn' },
  { href: '/orders', label: 'Đơn của tôi' },
  { href: '/#faq', label: 'Câu hỏi thường gặp' },
];

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await getMe();
  return (
    <html lang="vi" className={`${geist.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-sm">
            <Link href="/" className="flex items-center gap-2 text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">M</span>
              Metus Cert
            </Link>
            <div className="order-3 flex w-full gap-5 overflow-x-auto text-slate-600 sm:order-none sm:w-auto">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-indigo-600">
                  {n.label}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link href="/admin" className="whitespace-nowrap font-medium text-indigo-600">
                  Quản lý
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="hidden text-slate-500 sm:inline">{user.username}</span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="text-slate-600 hover:text-indigo-600">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <div className="font-semibold text-slate-900">Metus Cert</div>
              <p className="mt-2">Chứng chỉ ký app iOS để cài Metus Browser, giao tự động sau khi thanh toán.</p>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">Liên kết</div>
              <Link href="/buy" className="block hover:text-indigo-600">Mua chứng chỉ</Link>
              <Link href="/orders" className="block hover:text-indigo-600">Đơn của tôi</Link>
              <Link href="/#faq" className="block hover:text-indigo-600">Câu hỏi thường gặp</Link>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">Hỗ trợ</div>
              <a href="https://t.me/metusvn" target="_blank" rel="noreferrer" className="block hover:text-indigo-600">
                Telegram @metusvn
              </a>
            </div>
          </div>
          <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Metus. Tất cả quyền được bảo lưu.
          </div>
        </footer>
      </body>
    </html>
  );
}
