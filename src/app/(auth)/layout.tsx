import Link from 'next/link';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-paper px-5 py-14">
      <Link href="/" className="mb-7 flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-2xl font-extrabold italic leading-none text-lime">m</span>
        metus
      </Link>
      {children}
    </div>
  );
}
