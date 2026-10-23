'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppInfo } from '@/lib/api';
import { fmtSize } from '@/lib/format';
import { useI18n } from '@/lib/i18n';

const input = 'w-full rounded-lg border border-[#dfe5de] bg-white px-3 py-2 text-xs';

/** Tải IPA lên: gửi thẳng nội dung file (XHR để có tiến trình), BE ghi xuống đĩa theo luồng. */
export default function AdminAppUpload({ app }: { app: AppInfo }) {
  const router = useRouter();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const maxMb = app.maxMb ?? 100;

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    // Đoán phiên bản từ tên file, vd Metus-1.0.2-2026...-unsigned.ipa -> 1.0.2
    if (f) setVersion(f.name.match(/(\d+\.\d+(?:\.\d+)?)/)?.[1] ?? '');
  }

  function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = fileRef.current?.files?.[0];
    setMsg('');
    setError('');
    if (!file) return setError(t('admin.pickIpaToUpload'));
    if (!/\.ipa$/i.test(file.name)) return setError(t('admin.onlyIpaAccepted'));
    if (file.size > maxMb * 1048576) return setError(t('admin.fileTooBig', { mb: maxMb }));

    const q = new URLSearchParams({
      version: String(form.get('version') || '').trim(),
      name: String(form.get('name') || '').trim(),
      bundleId: String(form.get('bundleId') || '').trim(),
      minOs: String(form.get('minOs') || '').trim(),
    });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/cert-shop/admin/app/upload?${q}`);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
    xhr.onload = () => {
      setProgress(null);
      let body: { message?: string | string[]; sha256?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* Cloudflare/nginx có thể trả trang chữ */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        setMsg(t('admin.uploadedSha', { sha: body.sha256?.slice(0, 16) ?? '' }));
        if (fileRef.current) fileRef.current.value = '';
        router.refresh();
      } else {
        const m = Array.isArray(body.message) ? body.message[0] : body.message;
        setError(m || (xhr.status === 413 ? t('admin.fileTooBigServer') : t('admin.uploadFailed', { code: xhr.status })));
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError(t('admin.uploadConnectionLost'));
    };
    setProgress(0);
    xhr.send(file);
  }

  async function remove() {
    if (!confirm(t('admin.confirmRemoveApp'))) return;
    const r = await fetch('/api/cert-shop/admin/app', { method: 'DELETE' });
    if (r.ok) router.refresh();
    else setError(t('admin.removeFailed'));
  }

  return (
    <section className="space-y-3 rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t('admin.publishedAppTitle')}</h2>
          <p className="mt-0.5 text-xs text-muted">{t('admin.publishedAppDesc')}</p>
        </div>
        {app.available && (
          <button onClick={remove} className="shrink-0 text-xs text-red-600 hover:underline">
            {t('admin.removeApp')}
          </button>
        )}
      </div>

      {app.available ? (
        <div className="rounded-lg bg-tint p-3 text-xs leading-[1.8]">
          <b>{app.name}</b> · v{app.version} · {fmtSize(app.size)}
          <br />
          <span className="text-muted">{[app.bundleId, app.minOs && `iOS ${app.minOs}+`].filter(Boolean).join(' · ') || t('admin.noBundleInfo')}</span>
        </div>
      ) : (
        <p className="rounded-lg bg-[#f7f9f5] p-3 text-xs text-muted">{t('admin.noAppPublished')}</p>
      )}

      <form onSubmit={upload} className="grid gap-2 sm:grid-cols-2">
        <input ref={fileRef} type="file" accept=".ipa" onChange={pick} className={`${input} sm:col-span-2`} />
        <input name="name" defaultValue={app.name || 'Metus Browser'} placeholder={t('admin.displayName')} className={input} />
        <input name="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder={t('admin.versionPlaceholder')} required className={input} />
        <input name="bundleId" defaultValue={app.bundleId || 'com.metus.browser'} placeholder="Bundle ID" className={input} />
        <input name="minOs" defaultValue={app.minOs || ''} placeholder={t('admin.minOsPlaceholder')} className={input} />

        {progress !== null && (
          <div className="sm:col-span-2">
            <div className="h-2 overflow-hidden rounded-full bg-[#edf0eb]">
              <div className="h-full bg-mint transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-muted">{t('admin.uploadingPercent', { n: progress })}</div>
          </div>
        )}
        {error && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
        {msg && <p className="text-xs text-green-700 sm:col-span-2">{msg}</p>}
        <button disabled={progress !== null} className="rounded-lg bg-ink px-4 py-2.5 text-xs font-medium text-white disabled:opacity-60 sm:col-span-2">
          {progress !== null ? t('admin.uploadingEllipsis') : app.available ? t('admin.uploadReplace') : t('admin.uploadIpa')}
        </button>
        <p className="text-[10px] text-muted sm:col-span-2">{t('admin.maxMbNote', { mb: maxMb })}</p>
      </form>
    </section>
  );
}
