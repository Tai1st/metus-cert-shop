'use client';

import { useState } from 'react';
import { post } from '@/lib/client';
import { useI18n } from '@/lib/i18n';

interface JobView {
  state: 'created' | 'waiting' | 'running' | 'done' | 'failed';
  error: string;
  installUrl?: string;
  downloadUrl?: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Nút "Cài đặt": tự lấy chứng chỉ khách đã mua và ký app của shop trên server (không cần khách
 * tự tải chứng chỉ rồi vào trang Ký IPA), xong thì mở thẳng liên kết cài đặt trên Safari.
 */
export default function InstallButton({ endpoint = '/app/install' }: { endpoint?: string }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState<JobView | null>(null);

  async function run() {
    setBusy(true);
    setError('');
    setReady(null);
    setMsg(t('apps.preparingCert'));

    const start = await post<{ jobId: string }>(endpoint);
    if (!start.ok) {
      setBusy(false);
      setMsg('');
      return setError(start.error);
    }

    setMsg(t('apps.signingApp'));
    for (let i = 0; i < 160; i++) {
      await wait(1500);
      const r = await fetch(`/api/cert-shop/sign/jobs/${start.data.jobId}`);
      if (!r.ok) {
        setBusy(false);
        setMsg('');
        return setError(t('apps.statusReadError'));
      }
      const v = (await r.json()) as JobView;
      if (v.state === 'done') {
        setBusy(false);
        setMsg('');
        setReady(v);
        // Mở ngay liên kết cài đặt trên Safari; nút bên dưới là dự phòng nếu trình duyệt chặn điều hướng tự động.
        if (v.installUrl) window.location.href = v.installUrl;
        return;
      }
      if (v.state === 'failed') {
        setBusy(false);
        setMsg('');
        return setError(v.error || t('sign.signFailed'));
      }
    }
    setBusy(false);
    setMsg('');
    setError(t('apps.signTimeout'));
  }

  if (ready?.installUrl) {
    return (
      <a
        href={ready.installUrl}
        className="flex items-center justify-center rounded-[9px] bg-lime py-3 text-center text-[10px] font-semibold text-[#2b461a] hover:bg-lime-dark"
      >
        {t('apps.installNow')}
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="flex w-full items-center justify-center rounded-[9px] bg-lime py-3 text-center text-[10px] font-semibold text-[#2b461a] hover:bg-lime-dark disabled:opacity-60"
      >
        {busy ? msg || t('common.processing') : t('apps.install')}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-[9px] text-[#b45b45]">
          {error}
        </p>
      )}
    </div>
  );
}
