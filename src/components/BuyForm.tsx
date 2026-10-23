'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import type { Plan } from '@/lib/api';

export default function BuyForm({ enrollToken, plans }: { enrollToken: string; plans: Plan[] }) {
  const router = useRouter();
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError('');
    const r = await post<{ code: string }>('/orders', { enrollToken, planId });
    setLoading(false);
    if (!r.ok) return setError(r.error);
    router.push(`/orders/${r.data.code}`);
  }

  if (plans.length === 0) return <p className="text-sm text-slate-500">Hiện chưa có gói nào để bán.</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Bước 2: Chọn gói</h1>
      {plans.map((p) => (
        <label
          key={p.id}
          className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 ${
            planId === p.id ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'
          }`}
        >
          <input type="radio" name="plan" className="mt-1" checked={planId === p.id} onChange={() => setPlanId(p.id)} />
          <div className="flex-1">
            <div className="font-medium">{p.title}</div>
            <div className="text-xs text-slate-500">
              {[p.receiveTime && `Nhận: ${p.receiveTime}`, p.validity && `Hạn: ${p.validity}`, p.warranty && `BH: ${p.warranty}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
          <div className="font-bold text-indigo-600">{p.price.toLocaleString('vi-VN')}đ</div>
        </label>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || !planId}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Đang tạo đơn...' : 'Tạo đơn & thanh toán'}
      </button>
    </div>
  );
}
