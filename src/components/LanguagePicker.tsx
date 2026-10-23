'use client';

import { useI18n, type Locale } from '@/lib/i18n';

const OPTIONS: { code: Locale; flag: string }[] = [
  { code: 'vi', flag: '🇻🇳' },
  { code: 'en', flag: '🇺🇸' },
];

/** Màn chọn ngôn ngữ bắt buộc khi khách vào site lần đầu (chưa có lựa chọn lưu trong trình duyệt). */
export function LanguagePickerGate() {
  const { ready, chosen, setLocale, t } = useI18n();
  if (!ready || chosen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c202675] p-5 backdrop-blur-[6px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-picker-title"
        className="w-[380px] max-w-full rounded-[22px] bg-white p-7 text-center shadow-[0_30px_90px_#0003]"
      >
        <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-deep text-xl font-extrabold italic leading-none text-lime">
          m
        </div>
        <div className="mb-2 text-[10px] font-bold tracking-[2px] text-[#87b844]">{t('picker.eyebrow')}</div>
        <h2 id="lang-picker-title" className="mb-2 text-lg font-bold tracking-tight">
          {t('picker.title')}
        </h2>
        <p className="mb-6 text-xs leading-relaxed text-muted">{t('picker.sub')}</p>
        <div className="grid gap-2.5">
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => setLocale(o.code)}
              className="flex items-center justify-center gap-2.5 rounded-[10px] border border-line bg-white p-[15px] text-sm font-semibold transition hover:border-[#9cba72] hover:bg-[#f5f8ef]"
            >
              <span aria-hidden>{o.flag}</span>
              {t(`picker.${o.code}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Nút chuyển đổi ngôn ngữ nhỏ gọn, dùng trong topbar / thanh bên. */
export function LocaleSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const other: Locale = locale === 'vi' ? 'en' : 'vi';
  return (
    <button
      type="button"
      onClick={() => setLocale(other)}
      aria-label={`Switch to ${other === 'vi' ? 'Tiếng Việt' : 'English'}`}
      className={`rounded-[9px] border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#526349] hover:bg-[#f3f6ed] ${className}`}
    >
      {locale}
    </button>
  );
}
