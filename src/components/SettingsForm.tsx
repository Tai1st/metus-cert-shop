'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { put } from '@/lib/client';
import { useI18n } from '@/lib/i18n';

export interface ShopSettingsView {
  siteUrl: string;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
  priceMarkup: number;
  priceRoundTo: number;
  planFeatures: string[];
  chungchiBaseUrl: string;
  hasApiKey: boolean;
  apiKeyHint: string;
  hasWebhookSecret: boolean;
}

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';

export default function SettingsForm({ initial }: { initial: ShopSettingsView }) {
  const router = useRouter();
  const { t } = useI18n();
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
    // Mỗi dòng một ý; để trống = dùng mô tả mặc định
    body.planFeatures = (f.planFeatures || '').split(/\r?\n/);
    const r = await put('/admin/settings', body);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setMsg(t('admin.settingsSaved'));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title={t('admin.sectionBankTransfer')}>
        <Field label={t('admin.fieldBankId')}>
          <input name="bankId" defaultValue={initial.bankId} className={input} />
        </Field>
        <Field label={t('admin.fieldAccountNo')}>
          <input name="bankAccountNo" defaultValue={initial.bankAccountNo} className={input} />
        </Field>
        <Field label={t('admin.fieldAccountName')}>
          <input name="bankAccountName" defaultValue={initial.bankAccountName} className={input} />
        </Field>
      </Section>

      <Section title={t('admin.sectionPricing')}>
        <Field label={t('admin.fieldMarkup')}>
          <input name="priceMarkup" type="number" step="0.01" min="1" max="10" defaultValue={initial.priceMarkup} className={input} />
        </Field>
        <Field label={t('admin.fieldRoundTo')}>
          <input name="priceRoundTo" type="number" min="1" defaultValue={initial.priceRoundTo} className={input} />
        </Field>
      </Section>

      <Section title={t('admin.sectionFeatures')}>
        <Field label={t('admin.fieldFeatures')}>
          <textarea name="planFeatures" rows={5} defaultValue={initial.planFeatures.join('\n')} className={input} />
        </Field>
      </Section>

      <Section title={t('admin.sectionProvider')}>
        <Field label={t('admin.fieldApiUrl')}>
          <input name="chungchiBaseUrl" defaultValue={initial.chungchiBaseUrl} className={input} />
        </Field>
        <Field label={initial.hasApiKey ? t('admin.fieldApiKeySet', { hint: initial.apiKeyHint }) : t('admin.fieldApiKeyUnset')}>
          <input name="chungchiApiKey" type="password" autoComplete="off" placeholder={t('admin.enterToChange')} className={input} />
        </Field>
        <Field label={initial.hasWebhookSecret ? t('admin.fieldWebhookSet') : t('admin.fieldWebhookUnset')}>
          <input name="webhookSecret" type="password" autoComplete="off" placeholder="whsec_..." className={input} />
        </Field>
      </Section>

      <Section title={t('admin.sectionSiteUrl')}>
        <Field label={t('admin.fieldSiteUrl')}>
          <input name="siteUrl" defaultValue={initial.siteUrl} className={input} />
        </Field>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      <button disabled={busy} className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {busy ? t('admin.saving') : t('admin.saveSettings')}
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
