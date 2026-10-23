'use client';

import { useState } from 'react';
import { post } from '@/lib/client';

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
export default function InstallButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState<JobView | null>(null);

  async function run() {
    setBusy(true);
    setError('');
    setReady(null);
    setMsg('Đang chuẩn bị chứng chỉ…');

    const start = await post<{ jobId: string }>('/app/install');
    if (!start.ok) {
      setBusy(false);
      setMsg('');
      return setError(start.error);
    }

    setMsg('Đang ký ứng dụng…');
    for (let i = 0; i < 160; i++) {
      await wait(1500);
      const r = await fetch(`/api/cert-shop/sign/jobs/${start.data.jobId}`);
      if (!r.ok) {
        setBusy(false);
        setMsg('');
        return setError('Không đọc được trạng thái, vui lòng thử lại');
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
        return setError(v.error || 'Ký thất bại');
      }
    }
    setBusy(false);
    setMsg('');
    setError('Ký quá lâu, vui lòng thử lại');
  }

  if (ready?.installUrl) {
    return (
      <a
        href={ready.installUrl}
        className="flex items-center justify-center rounded-full bg-mint py-3.5 text-sm font-bold text-[#20321a] hover:bg-mint-dark"
      >
        Cài đặt ngay
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="flex w-full items-center justify-center rounded-full bg-mint py-3.5 text-sm font-bold text-[#20321a] hover:bg-mint-dark disabled:opacity-60"
      >
        {busy ? msg || 'Đang xử lý…' : 'Cài đặt'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-[11px] text-[#b63838]">
          {error}
        </p>
      )}
    </div>
  );
}
