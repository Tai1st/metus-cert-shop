'use client';

import { useState } from 'react';
import { Use } from './IconSprite';
import { useI18n } from '@/lib/i18n';

/** Nút icon sao chép một chuỗi (vd UDID) vào clipboard, có phản hồi ngắn khi đã sao chép. */
export default function CopyButton({ value, className = '' }: { value: string; className?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API có thể bị chặn (http không an toàn, quyền trình duyệt...): bỏ qua, không báo lỗi khó hiểu.
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t('common.copied') : t('common.copy')}
      title={copied ? t('common.copied') : t('common.copy')}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-line bg-white p-1.5 text-[#5d7e3d] transition hover:bg-[#f5f8ef] ${className}`}
    >
      <Use id={copied ? 'i-check' : 'i-copy'} className="icon h-3.5 w-3.5" />
    </button>
  );
}
