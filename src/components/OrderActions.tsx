'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';

const PENDING = ['awaiting_payment', 'paid', 'provisioning'];

export default function OrderActions({ code, status, hasProvider }: { code: string; status: string; hasProvider: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Webhook chỉ gửi một lần nên đơn đang chờ cần poll dự phòng (và để trang tự cập nhật)
  useEffect(() => {
    if (!PENDING.includes(status)) return;
    const t = setInterval(async () => {
      await post(`/orders/${code}/sync`);
      router.refresh();
    }, 8000);
    return () => clearInterval(t);
  }, [code, status, router]);

  async function run(path: string, format: (d: Record<string, unknown>) => string) {
    setBusy(true);
    setMsg('');
    const r = await post(`/orders/${code}/${path}`);
    setBusy(false);
    setMsg(r.ok ? format(r.data) : r.error);
  }

  if (status !== 'completed') return null;
  const btn = 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-60';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a href={`/api/cert-shop/orders/${code}/download`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          Tải chứng chỉ (.zip)
        </a>
        {hasProvider && (
          <>
            <button
              disabled={busy}
              className={btn}
              onClick={() => run('check', (d) => (d.valid ? 'Chứng chỉ hợp lệ' : `Chứng chỉ có vấn đề: ${d.message || d.status}`))}
            >
              Kiểm tra chứng chỉ
            </button>
            <button
              disabled={busy}
              className={btn}
              onClick={() => run('warranty', (d) => String(d.message || 'Đã gửi yêu cầu bảo hành'))}
            >
              Yêu cầu bảo hành
            </button>
          </>
        )}
      </div>
      {msg && <p className="text-sm text-slate-700">{msg}</p>}
    </div>
  );
}
