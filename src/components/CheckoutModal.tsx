'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { post } from '@/lib/client';
import type { Plan } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import CopyButton from './CopyButton';

export interface Enroll {
  token: string;
  udid: string;
  product?: string;
  version?: string;
}

const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

/** Cửa sổ "Hoàn tất thanh toán": UDID, loại thiết bị, mật khẩu chứng chỉ, phương thức thanh toán. */
export default function CheckoutModal({
  plan,
  loggedIn,
  enroll,
  onGuide,
  onClose,
}: {
  plan: Plan;
  loggedIn: boolean;
  enroll: Enroll | null;
  onGuide: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const METHODS = [
    { id: 'vietqr', label: 'VietQR', on: true },
    { id: 'balance', label: t('checkout.methodBalance'), on: false },
    { id: 'usdt', label: 'USDT', on: false },
    { id: 'paypal', label: 'PayPal', on: false },
  ];
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const next = `/?plan=${encodeURIComponent(plan.id)}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll) return;
    setBusy(true);
    setError('');
    const r = await post<{ code: string }>('/orders', {
      enrollToken: enroll.token,
      planId: plan.id,
      // Để trống thì BE tự tạo mật khẩu ngẫu nhiên
      ...(password.trim() && { p12Password: password.trim() }),
    });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    try {
      localStorage.removeItem('metus_plan');
    } catch {
      /* trình duyệt chặn lưu trữ: bỏ qua */
    }
    router.push(`/orders/${r.data.code}`);
  }

  const label = 'mb-2 block text-[11px] font-semibold';
  const field = 'w-full rounded-[14px] border border-[#e1e7e0] bg-[#f6f8f4] px-4 py-3 text-xs outline-none focus:border-[#6c9b44] focus:shadow-[0_0_0_3px_#c7f36b35]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c202675] p-4 backdrop-blur-[6px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative max-h-[92vh] w-[420px] max-w-full overflow-y-auto rounded-[22px] bg-white p-6 shadow-[0_30px_90px_#0003]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute right-4 top-3.5 h-7 w-7 rounded-full bg-[#f2f5ef] text-[#64715e]"
        >
          ×
        </button>

        <h2 id="checkout-title" className="mb-1 mt-1 text-center text-[22px] font-extrabold tracking-tight">
          {t('checkout.titleStart')} <span className="text-[#f26b1d]">{t('checkout.titleEnd')}</span>
        </h2>
        <p className="mb-5 text-center text-[11px] text-muted">
          {plan.title} · <b className="text-ink">{vnd(plan.price)}</b>
        </p>

        {!loggedIn ? (
          <div className="space-y-3 py-2">
            <p className="text-xs leading-[1.8] text-muted">{t('checkout.loginToSave')}</p>
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="flex w-full items-center justify-center rounded-[12px] bg-mint p-3.5 text-xs font-bold text-[#20321a] hover:bg-mint-dark"
            >
              {t('checkout.loginToContinue')} →
            </Link>
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="flex w-full items-center justify-center rounded-[12px] border border-[#d8dfd9] p-3 text-xs font-semibold hover:bg-[#edf2e9]"
            >
              {t('auth.createAccount')}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className={label}>{t('checkout.yourUdid')}</label>
              {enroll ? (
                <div className="flex items-center gap-2 rounded-[14px] border border-[#cfe0bd] bg-tint px-4 py-3">
                  <div className="min-w-0 flex-1 break-all font-mono text-[11px]">{enroll.udid}</div>
                  <CopyButton value={enroll.udid} />
                </div>
              ) : (
                <div className={`${field} text-[#9aa89a]`}>{t('checkout.udidPlaceholder')}</div>
              )}
              {!enroll && (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <a
                    href="/api/cert-shop/udid/profile"
                    className="rounded-[12px] bg-ink p-3 text-center text-[11px] font-bold text-white hover:bg-ink-dark"
                  >
                    {t('checkout.getUdid')}
                  </a>
                  <button
                    type="button"
                    onClick={onGuide}
                    className="rounded-[12px] border border-[#dfe6d7] bg-[#f5f8ef] p-3 text-[11px] font-bold text-[#5d7e3d]"
                  >
                    {t('nav.guide')}
                  </button>
                </div>
              )}
              {enroll && (
                <p className="mt-1.5 text-[10px] text-muted">
                  {[enroll.product, enroll.version && `iOS ${enroll.version}`].filter(Boolean).join(' · ')}
                  {' · '}
                  <button type="button" onClick={onGuide} className="text-[#648d42]">
                    {t('checkout.howToGetUdid')}
                  </button>
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className={label} htmlFor="p12">
                {t('checkout.setCertPassword')}
              </label>
              <input
                id="p12"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 32))}
                placeholder={t('checkout.passwordPlaceholder')}
                autoComplete="off"
                className={field}
              />
              <p className="mt-1.5 text-[10px] text-muted">{t('checkout.passwordHint')}</p>
            </div>

            <div className="mb-4">
              <label className={label}>{t('checkout.choosePaymentMethod')}</label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <div
                    key={m.id}
                    aria-disabled={!m.on}
                    className={`rounded-full border py-2.5 text-center text-xs font-bold ${
                      m.on ? 'border-[#4f733d] bg-tint text-ink' : 'border-[#e6ebe4] bg-[#f6f8f4] text-[#b0bbb0]'
                    }`}
                  >
                    {m.label}
                    {!m.on && <span className="ml-1 text-[9px] font-normal">{t('checkout.comingSoon')}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-[#f7f9f5] p-4 text-[11px] text-[#748174]">
              <div className="mb-2.5 flex justify-between"><span>{t('checkout.certPlan')}</span><strong className="font-medium text-ink">{plan.title.replace(/^Gói\s+/i, '')}</strong></div>
              <div className="mb-2.5 flex justify-between"><span>{t('checkout.warranty')}</span><strong className="font-medium text-ink">{plan.warranty || '—'}</strong></div>
              <div className="flex justify-between border-t border-dashed border-[#d8dfd3] pt-3 font-bold text-ink">
                <span>{t('checkout.total')}</span>
                <strong className="text-xl tracking-[-0.7px]">{vnd(plan.price)}</strong>
              </div>
            </div>

            <div role="alert" className="mb-2 min-h-3 text-[11px] text-[#b63838]">{error}</div>
            <button
              disabled={busy || !enroll}
              className="flex w-full items-center justify-center gap-3 rounded-[12px] bg-mint p-3.5 text-xs font-bold text-[#20321a] transition hover:bg-mint-dark disabled:opacity-50"
            >
              {busy ? t('checkout.creatingOrder') : enroll ? t('checkout.pay') : t('checkout.getUdidToContinue')} <span>→</span>
            </button>
            <div className="mt-3 text-center text-[9px] text-[#8a9587]">♧ &nbsp; {t('checkout.noAppleIdRequired')}</div>
          </>
        )}
      </form>
    </div>
  );
}
