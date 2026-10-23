import type { Metadata } from 'next';
import Link from 'next/link';
import { Be_Vietnam_Pro } from 'next/font/google';
import { getMe } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';
import Nav, { MobileMenu } from '@/components/Nav';
import './globals.css';

const font = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Metus Browser: cài đặt trên iPhone',
  description: 'Mua chứng chỉ, ký IPA và cài Metus Browser trên iPhone',
};

const FOOTER = [
  {
    title: 'Liên hệ hỗ trợ',
    links: [{ label: 'Telegram', href: 'https://t.me/metusvn', external: true }],
  },
  {
    title: 'Tìm hiểu thêm',
    links: [
      { label: 'Chính sách của Apple', href: 'https://developer.apple.com/support/certificates/', external: true },
      { label: 'Hướng dẫn cài đặt', href: '/#guide' },
      { label: 'Câu hỏi thường gặp', href: '/#faq' },
    ],
  },
  {
    title: 'Công cụ khác',
    links: [
      { label: 'Lấy UDID', href: '/#install' },
      { label: 'Kho ứng dụng', href: '/apps' },
      { label: 'Ký IPA', href: '/sign' },
      { label: 'Kiểm tra chứng chỉ', href: '/check' },
      { label: 'Tìm đơn hàng', href: '/lookup' },
    ],
  },
];

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await getMe();
  return (
    <html lang="vi" className={`${font.variable} h-full scroll-smooth antialiased`}>
      <body className="flex min-h-full flex-col text-[14px]">
        {/* Dính trên cùng khi cuộn, nền mờ để chữ phía sau không chồng lên menu */}
        <header className="sticky top-0 z-30 border-b border-transparent bg-paper/85 backdrop-blur">
          <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-3 px-5 sm:h-[88px] sm:px-9">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight sm:text-[23px]">
              <span className="grid h-[37px] w-[37px] place-items-center rounded-[11px] bg-ink text-2xl font-extrabold italic text-mint">m</span>
              metus
              <span className="hidden text-[15px] font-normal tracking-tight text-[#7d897d] xl:inline">/ browser</span>
            </Link>

            <Nav isAdmin={Boolean(user?.isAdmin)} />

            {/* Màn hình hẹp: nút menu thay cho thanh viên thuốc và các nút tài khoản */}
            <MobileMenu isAdmin={Boolean(user?.isAdmin)} username={user?.username ?? null} />

            <div className="hidden items-center gap-2 text-xs lg:flex">
              {user ? (
                <>
                  <Link href="/orders" className="hidden rounded-full border border-[#d8dfd9] bg-white px-4 py-2.5 font-semibold hover:bg-[#edf2e9] sm:inline-block">
                    {user.username}
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="px-2 py-3 font-semibold">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="rounded-full bg-ink px-4 py-2.5 text-white hover:bg-ink-dark">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1210px] flex-1 px-5 py-8 sm:px-9 sm:py-12">{children}</main>

        <footer className="mx-auto mt-6 w-full max-w-[1140px] px-5 pb-8 pt-10 text-xs">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide">Tham gia cùng chúng tôi</h3>
              <a
                href="https://t.me/metusvn"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1d7cf2] px-5 py-3 text-[12px] font-bold text-white hover:bg-[#1668cf]"
              >
                <span aria-hidden>✈</span> Group Chat
              </a>
            </div>
            {FOOTER.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide">{col.title}</h3>
                <ul className="space-y-2.5 text-[#6c7a77]">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {'external' in l && l.external ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="hover:text-ink">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-[10px] text-[#8b948a]">© {new Date().getFullYear()} Metus. Thiết kế cho trải nghiệm của bạn.</p>
        </footer>
      </body>
    </html>
  );
}
