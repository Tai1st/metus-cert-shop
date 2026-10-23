'use client';

import { useRef, useState } from 'react';
import { post } from '@/lib/client';
import { Use } from './IconSprite';
import { Card, InfoRow, PageHead, ResultEmpty } from './ui';
import { useI18n } from '@/lib/i18n';

interface Cert {
  commonName: string;
  organization: string;
  teamId: string;
  type: string;
  notBefore: string;
  notAfter: string;
  expired: boolean;
  notYetValid: boolean;
  daysLeft: number;
}
interface Profile {
  name?: string;
  teamName?: string;
  appId?: string;
  expires?: string;
  expired?: boolean;
  daysLeft?: number | null;
  allDevices?: boolean;
  devices?: number;
  matchesCert?: boolean;
  error?: string;
}
interface Result {
  certificate: Cert;
  profile: Profile | null;
}

const field =
  'min-h-[43px] w-full rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-[10px] outline-none focus:border-[#9cba72] focus:shadow-[0_0_0_3px_#d0e5ad30]';
const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(new Error('File read error'));
    r.readAsDataURL(file);
  });

export default function CheckForm() {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    setError('');
    setResult(null);
    if (!file || !/\.zip$/i.test(file.name)) return setError(t('check.pickZip'));
    if (file.size > 1024 * 1024) return setError(t('check.zipTooBig'));
    setBusy(true);
    try {
      const r = await post<Result>('/check', { zip: await toBase64(file), password });
      if (!r.ok) setError(r.error);
      else setResult(r.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.somethingWrong'));
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHead title={t('check.pageTitle')} sub={t('check.pageSub')} />
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-[23px] shadow-[0_5px_24px_#21361703]">
          <div className="mb-[22px] flex items-center gap-2.5 text-xs font-semibold">
            <Use id="i-check" className="icon h-[18px] w-[18px] text-[#5b7150]" /> {t('check.certInfo')}
          </div>
          <label className="mb-[9px] block text-[10px] font-medium">{t('check.enterCertFile')}</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={`${field} mb-5 flex items-center gap-2 text-left ${name ? 'text-ink' : 'text-[#9aa89a]'}`}
          >
            <span aria-hidden>▤</span>
            <span className="truncate">{name || t('check.pickZipFile')}</span>
          </button>
          <input ref={fileRef} type="file" accept=".zip" hidden onChange={(e) => setName(e.target.files?.[0]?.name ?? '')} />

          <label className="mb-[9px] block text-[10px] font-medium" htmlFor="pw">
            {t('checkout.setCertPassword')}
          </label>
          <input id="pw" name="password" type="password" autoComplete="off" placeholder={t('check.passwordIfAny')} disabled={busy} className={`${field} mb-5`} />

          <div className="mb-5 rounded-[10px] border border-[#e7efd9] bg-[#f2f7eb] p-3.5 text-[10px] leading-[1.9] text-[#8b9d75]">{t('check.notStoredNote')}</div>

          {error && (
            <p role="alert" className="mb-3 text-[10px] text-[#b45b45]">
              {error}
            </p>
          )}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2.5 rounded-[9px] bg-deep py-3 text-[10px] font-semibold text-white hover:bg-deep-dark disabled:opacity-60">
            {busy ? t('check.checking') : t('check.viewResult')}
          </button>
        </form>

        <Card>
          <div className="mb-[22px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">{t('check.resultTitle')}</h2>
          </div>
          {!result ? (
            <ResultEmpty icon={<Use id="i-check" className="icon h-8 w-8" />} title={t('check.noResultYet')}>
              {t('check.noResultDesc')}
            </ResultEmpty>
          ) : (
            <ResultView r={result} />
          )}
        </Card>
      </div>
    </div>
  );
}

function ResultView({ r }: { r: Result }) {
  const { t } = useI18n();
  const c = r.certificate;
  const p = r.profile;
  const certOk = !c.expired && !c.notYetValid;
  const profOk = p && !p.error && !p.expired && p.matchesCert !== false;
  const good = certOk && (p ? profOk : true);
  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-3.5 text-[11px] font-bold ${good ? 'bg-[#edf5e3] text-[#598436]' : 'bg-[#fbe9e6] text-[#9a2b1b]'}`}>
        {good ? t('check.certGood') : t('check.certBad')}
      </div>

      <section>
        <h3 className="mb-1 text-[9px] font-bold tracking-[1.5px] text-accent">{t('check.certSectionTitle')}</h3>
        <InfoRow k={t('check.fieldName')} v={c.commonName || '—'} />
        <InfoRow k={t('check.fieldType')} v={c.type || '—'} />
        <InfoRow k={t('check.fieldOrg')} v={c.organization || '—'} />
        <InfoRow k="Team ID" v={c.teamId || '—'} mono />
        <InfoRow k={t('check.fieldValidity')} v={`${date(c.notBefore)} → ${date(c.notAfter)}`} />
        <InfoRow
          k={t('check.fieldRemaining')}
          v={c.notYetValid ? t('check.notYetValid') : c.expired ? t('check.expiredDaysAgo', { n: -c.daysLeft }) : t('check.daysLeft', { n: c.daysLeft })}
        />
      </section>

      {p && (
        <section className="border-t border-line pt-4">
          <h3 className="mb-1 text-[9px] font-bold tracking-[1.5px] text-accent">{t('check.profileSectionTitle')}</h3>
          {p.error ? (
            <p className="text-[10px] text-[#b45b45]">{p.error}</p>
          ) : (
            <>
              <InfoRow k={t('check.fieldProfileName')} v={p.name || '—'} />
              <InfoRow k="Team" v={p.teamName || '—'} />
              <InfoRow k="App ID" v={p.appId || '—'} mono />
              <InfoRow k={t('check.fieldExpires')} v={date(p.expires)} />
              <InfoRow
                k={t('check.fieldRemaining')}
                v={p.expired ? t('check.expiredDaysAgo', { n: -(p.daysLeft ?? 0) }) : p.daysLeft != null ? t('check.daysLeft', { n: p.daysLeft }) : '—'}
              />
              <InfoRow k={t('check.fieldDevices')} v={p.allDevices ? t('check.allDevices') : t('check.registeredDevices', { n: p.devices ?? 0 })} />
              <InfoRow k={t('check.fieldMatchesCert')} v={p.matchesCert ? t('common.yes') : t('check.matchNo')} />
            </>
          )}
        </section>
      )}
      <p className="border-t border-line pt-4 text-[9px] leading-[1.8] text-muted">{t('check.footerNote')}</p>
    </div>
  );
}
