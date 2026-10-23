'use client';

import { useState } from 'react';
import { Use } from './IconSprite';
import { Badge, Card, PageHead, ResultEmpty } from './ui';

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
    <div>
      <PageHead title="Tìm đơn hàng" sub="Tra cứu đơn bằng UDID hoặc mã đơn để tiếp tục trải nghiệm." />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.45fr]">
        <Card>
          <span className="mb-5 grid h-[52px] w-[52px] place-items-center rounded-2xl bg-[#e5efce] text-[#719b3f]">
            <Use id="i-lookup" className="icon h-6 w-6" />
          </span>
          <h2 className="text-[15px] tracking-[-0.4px]">Bạn đang tìm đơn nào?</h2>
          <p className="mt-3 text-[11px] leading-[1.8] text-muted">Nhập mã đơn hoặc UDID thiết bị. Thông tin sẽ hiển thị ở vùng kết quả bên cạnh.</p>
          <form onSubmit={submit} className="mt-6">
            <label className="mb-[9px] block text-[10px] font-medium" htmlFor="q">
              UDID hoặc mã đơn hàng
            </label>
            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ví dụ: MC7A2F9B"
              autoComplete="off"
              required
              className="mb-3 min-h-[43px] w-full rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-[10px] outline-none focus:border-[#9cba72] focus:shadow-[0_0_0_3px_#d0e5ad30]"
            />
            {error && (
              <p role="alert" className="mb-3 text-[10px] text-[#b45b45]">
                {error}
              </p>
            )}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2.5 rounded-[9px] bg-deep py-3 text-[10px] font-semibold text-white hover:bg-deep-dark disabled:opacity-60">
              <Use id="i-lookup" className="icon h-[15px] w-[15px]" /> {busy ? 'Đang tìm…' : 'Tìm đơn hàng'}
            </button>
          </form>
        </Card>

        <Card className="min-h-[310px]">
          <div className="mb-[22px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">Kết quả tra cứu</h2>
          </div>
          {rows === null ? (
            <ResultEmpty icon={<Use id="i-orders" className="icon h-8 w-8" />} title="Chưa có kết quả">
              Nhập UDID hoặc mã đơn và chọn tìm kiếm. Chi tiết đơn hàng sẽ hiển thị tại đây.
            </ResultEmpty>
          ) : rows.length === 0 ? (
            <ResultEmpty icon={<Use id="i-lookup" className="icon h-8 w-8" />} title="Chưa tìm thấy đơn hàng">
              Kiểm tra lại UDID hoặc mã đơn (phải nhập đầy đủ, chính xác).
            </ResultEmpty>
          ) : (
            <div className="space-y-3">
              {rows.map((o) => (
                <div key={o.code} className="rounded-xl border border-[#e2ebd6] bg-[#f7faf2] p-[22px] text-[10px]">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-mono text-sm">{o.code}</h3>
                    <Badge status={o.status} />
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-muted">
                    <div>{o.planTitle}</div>
                    <div className="font-mono">{o.udid}</div>
                    <div>Tạo lúc {new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
              ))}
              <p className="text-[9px] leading-[1.8] text-muted">Đăng nhập tài khoản đã đặt đơn để xem chi tiết, tải chứng chỉ và ứng dụng.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
