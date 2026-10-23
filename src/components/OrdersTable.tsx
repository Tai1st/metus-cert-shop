'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from './ui';
import { Use } from './IconSprite';

interface OrderRow {
  code: string;
  planTitle: string;
  udid: string;
  device: string;
  price: number;
  status: string;
  createdAt: string;
}

const FILTERS = [
  ['all', 'Tất cả'],
  ['awaiting_payment', 'Chờ thanh toán'],
  ['completed', 'Hoạt động'],
  ['provisioning', 'Đang xử lý'],
] as const;

/** Bảng đơn hàng có tìm kiếm và lọc trạng thái, lọc ngay trên dữ liệu đã tải (số đơn của một khách thường không nhiều). */
export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === 'all' || o.status === filter) &&
          `${o.code} ${o.planTitle} ${o.udid}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [orders, filter, query],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-[290px] flex-1">
          <Use id="i-lookup" className="icon absolute left-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#a4af98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mã đơn, tên gói hoặc thiết bị…"
            aria-label="Tìm đơn hàng"
            className="min-h-[43px] w-full rounded-lg border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] py-3 pl-9 pr-3 text-[10px] outline-none focus:border-[#9cba72]"
          />
        </div>
        <div className="flex gap-[3px] rounded-lg bg-[#f3f6ed] p-1">
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={`rounded-md px-3 py-2 text-[9px] ${filter === k ? 'bg-white text-[#476132] shadow-sm' : 'text-[#929f84]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-9 text-center text-[11px] text-muted">Không tìm thấy đơn hàng phù hợp.</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {['MÃ ĐƠN / NGÀY TẠO', 'GÓI / THIẾT BỊ', 'THANH TOÁN', 'TRẠNG THÁI', ''].map((h) => (
                  <th key={h} className="whitespace-nowrap bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.code} className="border-b border-[#f0f3eb] last:border-0">
                  <td className="px-[15px] py-[19px] text-[10px]">
                    <Link href={`/orders/${o.code}`} className="font-semibold">
                      {o.code}
                    </Link>
                    <small className="mt-1.5 block text-[8px] text-[#9aa78b]">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</small>
                  </td>
                  <td className="px-[15px] py-[19px] text-[10px]">
                    {o.planTitle}
                    <small className="mt-1.5 block text-[8px] text-[#9aa78b]">{o.device}</small>
                  </td>
                  <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">{o.price.toLocaleString('vi-VN')}đ</td>
                  <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">
                    <Badge status={o.status} />
                  </td>
                  <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">
                    <Link href={`/orders/${o.code}`} className="inline-flex rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] text-[#768867] hover:bg-[#f0f6e7]">
                      Xem chi tiết ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-2.5 flex justify-between border-t border-line pt-[18px] text-[8px] text-[#a0ad91]">
        <span>{filtered.length} đơn hàng</span>
      </div>
    </div>
  );
}
