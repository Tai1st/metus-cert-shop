import Link from 'next/link';
import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import OrderStatus from '@/components/OrderStatus';

export const dynamic = 'force-dynamic';

interface OrderRow {
  code: string;
  planTitle: string;
  udid: string;
  price: number;
  status: string;
}

export default async function OrdersPage() {
  if (!(await getMe())) redirect('/login');
  const r = await be<{ orders: OrderRow[] }>('/orders');
  const orders = r.ok ? r.data.orders : [];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-lg font-semibold">Đơn của tôi</h1>
      {orders.length === 0 && <p className="text-sm text-slate-500">Bạn chưa có đơn nào.</p>}
      {orders.map((o) => (
        <Link
          key={o.code}
          href={`/orders/${o.code}`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm hover:border-indigo-300"
        >
          <div>
            <div className="font-medium">
              {o.code} · {o.planTitle}
            </div>
            <div className="font-mono text-xs text-slate-500">{o.udid}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">{o.price.toLocaleString('vi-VN')}đ</span>
            <OrderStatus status={o.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
