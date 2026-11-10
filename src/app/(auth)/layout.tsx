import Link from 'next/link';
import { Use } from '@/components/IconSprite';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center bg-paper px-5 py-14">
      <Link
        href="/"
        aria-label="Trở về trang chủ"
        className="fixed left-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_3px_14px_#21361710] hover:bg-[#f3f5ee]"
      >
        <Use id="i-arrow" className="icon h-4 w-4 rotate-180" />
      </Link>
      <Link href="/" className="mb-7 flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-2xl font-extrabold italic leading-none text-lime">m</span>
        metus
      </Link>
      {children}
    </div>
  );
}
