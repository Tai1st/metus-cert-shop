'use client';

import { useState } from 'react';
import OrderStatus from './OrderStatus';

interface Row {
  code: string;
  planTitle: string;
  udid: string;
  status: string;
  createdAt: string;
}

export default function LookupForm() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setRows(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/cert-shop/lookup?q=${encodeURIComponent(q.trim())}`);
      const text = await res.text();
      let data: { orders?: Row[]; message?: string | string[] } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        /* Cloudflare/nginx có thể trả trang chữ */
      }
      if (!res.ok) {
        const m = Array.isArray(data.message) ? data.message[0] : data.message;
        setError(res.status === 429 ? 'Bạn tìm quá nhanh, vui lòng thử lại sau ít phút' : m || `Có lỗi xảy ra (${res.status})`);
      } else setRows(data.orders ?? []);
    } catch {
      setError('Mất kết nối, vui lòng thử lại');
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto grid max-w-[900px] gap-8 lg:grid-cols-[400px_1fr]">
      <div className="rounded-[26px] border border-line bg-white p-6 shadow-[0_2px_18px_#1428280a] sm:p-7">
        <h1 className="text-center text-[30px] font-extrabold tracking-tight">
          <span className="text-[#1d7cf2]">Tìm </span>
          <span className="text-[#f26b1d]">đơn hàng</span>
        </h1>
        <p className="mb-6 mt-1 text-center text-xs text-muted">Kiểm tra đơn hàng bằng UDID hoặc mã đơn hàng</p>
        <form onSubmit={submit}>
          <label className="mb-2 block text-center text-[11px] font-semibold" htmlFor="q">
            Nhập thông tin
          </label>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nhập UDID hoặc mã đơn hàng"
            autoComplete="off"
            required
            className="mb-5 w-full rounded-[14px] border border-[#e1e7e0] bg-[#f6f8f4] px-4 py-3 text-xs outline-none focus:border-[#6c9b44] focus:shadow-[0_0_0_3px_#c7f36b35]"
          />
          {error && (
            <p role="alert" className="mb-3 text-xs text-[#b63838]">
              {error}
            </p>
          )}
          <button disabled={busy} className="w-full rounded-full bg-[#2a86ff] p-4 text-sm font-bold text-white transition hover:bg-[#1f78ee] disabled:opacity-60">
            {busy ? 'Đang tìm…' : 'Tìm kiếm'}
          </button>
        </form>
      </div>

      <div className="min-w-0 self-start pt-4 lg:pt-8">
        {rows === null && (
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1ee] text-2xl text-[#8f9a99]">▤</div>
            <p className="text-lg font-semibold">Chưa có kết quả</p>
            <p className="mt-1 text-xs text-muted">Nhập UDID hoặc mã đơn rồi nhấn tìm kiếm để xem thông tin đơn hàng</p>
          </div>
        )}
        {rows?.length === 0 && (
          <div className="text-center">
            <p className="text-lg font-semibold">Không tìm thấy đơn hàng</p>
            <p className="mt-1 text-xs text-muted">Kiểm tra lại UDID hoặc mã đơn (phải nhập đầy đủ, chính xác).</p>
          </div>
        )}
        <div className="space-y-3">
          {rows?.map((o) => (
            <div key={o.code} className="rounded-2xl border border-line bg-white p-4 text-xs">
              <div className="flex items-center justify-between gap-3">
                <b className="font-mono text-sm">{o.code}</b>
                <OrderStatus status={o.status} />
              </div>
              <div className="mt-2 space-y-1 text-muted">
                <div>{o.planTitle}</div>
                <div className="font-mono">{o.udid}</div>
                <div>Tạo lúc {new Date(o.createdAt).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          ))}
          {rows && rows.length > 0 && (
            <p className="text-[10px] leading-[1.7] text-muted">Đăng nhập tài khoản đã đặt đơn để xem chi tiết, tải chứng chỉ và ứng dụng.</p>
          )}
        </div>
      </div>
    </div>
  );
}
