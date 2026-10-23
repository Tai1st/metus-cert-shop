'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

/** Các khối giao diện dùng chung trong khu Workspace, theo đúng style thẻ/bảng/nút của bản thiết kế. */

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-line bg-white p-[23px] shadow-[0_5px_24px_#21361703] ${className}`}>{children}</div>;
}

export function PageHead({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="mb-[29px] flex flex-wrap items-center justify-between gap-5">
      <div>
        <h1 className="mb-[9px] text-2xl font-bold tracking-tight sm:text-[29px] sm:tracking-[-1.1px]">{title}</h1>
        <p className="text-[11px] leading-[1.9] text-muted">{sub}</p>
      </div>
      {action}
    </div>
  );
}

export function BtnLink({
  href,
  children,
  variant = 'dark',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'dark' | 'lime' | 'light';
}) {
  const styles = {
    dark: 'bg-deep text-white border-deep hover:bg-deep-dark',
    lime: 'bg-lime text-[#2b461a] border-lime hover:bg-lime-dark',
    light: 'bg-white text-[#5c7150] border-line hover:bg-[#f3f6ed]',
  }[variant];
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2.5 rounded-[9px] border px-4 py-3 text-[10px] font-semibold ${styles}`}>
      {children}
    </Link>
  );
}

const STATUS_CLS: Record<string, string> = {
  awaiting_payment: 'bg-[#fff6dc] text-[#a27b28]',
  paid: 'bg-[#eaf3f6] text-[#598496]',
  provisioning: 'bg-[#eaf3f6] text-[#598496]',
  completed: 'bg-[#edf5e3] text-[#789b43]',
  failed: 'bg-[#fbe9e6] text-[#b45b45]',
  cancelled: 'bg-[#f1f3ee] text-[#7f8c75]',
};

export function Badge({ status }: { status: string }) {
  const { t } = useI18n();
  const cls = STATUS_CLS[status] || 'bg-[#f1f3ee] text-[#7f8c75]';
  const text = (t(`common.status.${status}`) !== `common.status.${status}` && t(`common.status.${status}`)) || status;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[8px] font-medium before:h-1 before:w-1 before:rounded-full before:bg-current ${cls}`}>
      {text}
    </span>
  );
}

export function Stat({ icon, title, value, caption }: { icon: React.ReactNode; title: string; value: string; caption: string }) {
  return (
    <Card className="p-5">
      <div className="mb-[15px] flex items-center justify-between text-[10px] text-[#88947e]">
        {title}
        <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-[#f1f6e8] text-[#8aa269]">{icon}</span>
      </div>
      <div className="text-[28px] font-semibold tracking-[-1px]">{value}</div>
      <div className="mt-[7px] text-[8px] text-[#a1ad94]">{caption}</div>
    </Card>
  );
}

export function InfoRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="my-[17px] flex justify-between gap-5 text-[10px]">
      <span className="text-[#94a086]">{k}</span>
      <strong className={`overflow-wrap-anywhere text-right font-medium text-[#4c6040] ${mono ? 'font-mono' : ''}`}>{v}</strong>
    </div>
  );
}

export function Message({ children, amber }: { children: React.ReactNode; amber?: boolean }) {
  return (
    <div
      className={`rounded-[10px] border p-3.5 text-[10px] leading-[1.9] ${
        amber ? 'border-[#f1e9d0] bg-[#fffaee] text-[#a18d5e]' : 'border-[#e7efd9] bg-[#f2f7eb] text-[#8b9d75]'
      }`}
    >
      {children}
    </div>
  );
}

export function ResultEmpty({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center p-8 text-center text-[#a0ae91]">
      <span className="mb-[18px] opacity-60">{icon}</span>
      <h3 className="mb-2 text-[#82966e]">{title}</h3>
      {children && <p className="max-w-[230px] text-[9px] leading-[1.8]">{children}</p>}
    </div>
  );
}
