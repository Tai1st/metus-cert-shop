'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { put } from '@/lib/client';

export interface ShopSettingsView {
  siteUrl: string;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
  priceMarkup: number;
  priceRoundTo: number;
  chungchiBaseUrl: string;
  hasApiKey: boolean;
  apiKeyHint: string;
  hasWebhookSecret: boolean;
}

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

export default function SettingsForm({ initial }: { initial: ShopSettingsView }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const body: Record<string, unknown> = { ...f };
    // Khóa bí mật để trống = giữ nguyên, không gửi lên
    if (!f.chungchiApiKey) delete body.chungchiApiKey;
    if (!f.webhookSecret) delete body.webhookSecret;
    body.priceMarkup = Number(f.priceMarkup);
    body.priceRoundTo = Number(f.priceRoundTo);
    const r = await put('/admin/settings', body);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setMsg('Đã lưu cấu hình');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Thanh toán chuyển khoản (VietQR)">
        <Field label="Mã ngân hàng (vd: ACB, VCB, MB)">
          <input name="bankId" defaultValue={initial.bankId} className={input} />
        </Field>
        <Field label="Số tài khoản">
          <input name="bankAccountNo" defaultValue={initial.bankAccountNo} className={input} />
        </Field>
        <Field label="Chủ tài khoản">
          <input name="bankAccountName" defaultValue={initial.bankAccountName} className={input} />
        </Field>
      </Section>

      <Section title="Giá bán">
        <Field label="Hệ số nhân giá gốc (vd: 1.3 = lãi 30%)">
          <input name="priceMarkup" type="number" step="0.01" min="1" max="10" defaultValue={initial.priceMarkup} className={input} />
        </Field>
        <Field label="Làm tròn lên tới (đ)">
          <input name="priceRoundTo" type="number" min="1" defaultValue={initial.priceRoundTo} className={input} />
        </Field>
      </Section>

      <Section title="Nhà cung cấp chungchi.store">
        <Field label="Địa chỉ API">
          <input name="chungchiBaseUrl" defaultValue={initial.chungchiBaseUrl} className={input} />
        </Field>
        <Field
          label={`API key ${initial.hasApiKey ? `(đã đặt ${initial.apiKeyHint}, để trống để giữ nguyên)` : '(chưa đặt)'}`}
        >
          <input name="chungchiApiKey" type="password" autoComplete="off" placeholder="Nhập để đổi" className={input} />
        </Field>
        <Field label={`Webhook secret ${initial.hasWebhookSecret ? '(đã đặt, để trống để giữ nguyên)' : '(chưa đặt)'}`}>
          <input name="webhookSecret" type="password" autoComplete="off" placeholder="whsec_..." className={input} />
        </Field>
      </Section>

      <Section title="Địa chỉ website shop">
        <Field label="URL công khai của shop (HTTPS khi chạy thật)">
          <input name="siteUrl" defaultValue={initial.siteUrl} className={input} />
        </Field>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      <button disabled={busy} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {busy ? 'Đang lưu...' : 'Lưu cấu hình'}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-slate-600">{label}</span>
      {children}
    </label>
  );
}
