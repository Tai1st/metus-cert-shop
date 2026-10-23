'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';

/** Nút hành động của admin trên một đơn: confirm (đã nhận tiền / gửi lại) hoặc cancel. */
export default function AdminConfirm({
  code,
  action,
  label,
}: {
  code: string;
  action: 'confirm' | 'cancel';
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    if (action === 'cancel' && !confirm(`Hủy đơn ${code}?`)) return;
    setBusy(true);
    setErr('');
    const r = await post<{ error?: string }>(`/admin/orders/${code}/${action}`);
    setBusy(false);
    setErr(r.ok ? r.data.error || '' : r.error);
    router.refresh();
  }

  const color = action === 'confirm' ? 'bg-green-600' : 'bg-slate-500';
  return (
    <div className="text-right">
      <button disabled={busy} onClick={run} className={`rounded-lg ${color} px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60`}>
        {busy ? '...' : label}
      </button>
      {err && <div className="mt-1 max-w-xs text-xs text-red-600">{err}</div>}
    </div>
  );
}
