import Link from 'next/link';
import { getMe } from '@/lib/api';
import MarketingTopbar from '@/components/MarketingTopbar';

const FOOTER = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Chứng chỉ iOS', href: '/#install' },
      { label: 'Kho ứng dụng', href: '/apps' },
      { label: 'Ký ứng dụng IPA', href: '/sign' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Hướng dẫn cài đặt', href: '/#guide' },
      { label: 'Tìm đơn hàng', href: '/lookup' },
      { label: 'Kiểm tra chứng chỉ', href: '/check' },
    ],
  },
  {
    title: 'Kết nối',
    links: [
      { label: 'Telegram Metus ↗', href: 'https://t.me/metusvn', external: true },
      { label: 'Câu hỏi thường gặp', href: '/#faq' },
      { label: 'Chứng chỉ Apple ↗', href: 'https://developer.apple.com/support/certificates/', external: true },
    ],
  },
];

export default async function MarketingLayout({ children }: LayoutProps<'/'>) {
  const user = await getMe();
  return (
    <div className="flex min-h-full flex-col">
      <MarketingTopbar loggedIn={Boolean(user)} username={user?.username ?? null} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1220px] px-6 py-9 sm:px-9">
          <div className="mb-9 flex flex-col items-start justify-between gap-8 sm:flex-row sm:gap-9">
            <div>
              <Link href="/" className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-tight">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-[25px] font-extrabold italic leading-none text-lime">m</span>
                <span>
                  metus
                  <small className="mt-0.5 block text-[7px] font-medium tracking-[2px] text-[#7e897f]">APP STORE</small>
                </span>
              </Link>
              <p className="mt-4 max-w-[230px] text-[10px] leading-[1.8] text-[#89947f]">
                Mở rộng trải nghiệm iOS.
                <br />
                Thiết kế cho cách bạn sử dụng mỗi ngày.
              </p>
            </div>
            <div className="flex gap-10 sm:gap-[75px]">
              {FOOTER.map((col) => (
                <div key={col.title}>
                  <strong className="mb-[15px] block text-[10px]">{col.title}</strong>
                  {col.links.map((l) =>
                    'external' in l && l.external ? (
                      <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="my-[13px] block text-[10px] text-[#89947f] hover:text-ink">
                        {l.label}
                      </a>
                    ) : (
                      <Link key={l.label} href={l.href} className="my-[13px] block text-[10px] text-[#89947f] hover:text-ink">
                        {l.label}
                      </Link>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between border-t border-line pt-[21px] text-[9px] text-[#96a08e]">
            <span>© {new Date().getFullYear()} Metus. Thiết kế cho trải nghiệm của bạn.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
