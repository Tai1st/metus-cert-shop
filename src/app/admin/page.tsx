import Link from 'next/link';
import { redirect } from 'next/navigation';
import { be, getMe, vnd } from '@/lib/api';
import AdminConfirm from '@/components/AdminConfirm';
import OrderStatus, { STATUS_LABEL } from '@/components/OrderStatus';

export const dynamic = 'force-dynamic';

interface Stats {
  counts: Record<string, number>;
  totalOrders: number;
  ordersToday: number;
  revenue: number;
  profit: number;
  providerWallet: { wallet: number; currency: string } | null;
}

interface Row {
  code: string;
  username: string;
  udid: string;
  planTitle: string;
  price: number;
  status: string;
  error?: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

export default async function AdminPage({ searchParams }: PageProps<'/admin'>) {
  const me = await getMe();
  if (!me?.isAdmin) redirect('/');

  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : '');
  const status = one('status');
  const q = one('q');
  const page = Math.max(1, Number(one('page')) || 1);

  const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (status) qs.set('status', status);
  if (q) qs.set('q', q);

  const [stats, list] = await Promise.all([
    be<Stats>('/admin/stats'),
    be<{ total: number; items: Row[] }>(`/admin/orders?${qs}`),
  ]);
  const s = stats.ok ? stats.data : null;
  const items = list.ok ? list.data.items : [];
  const total = list.ok ? list.data.total : 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => {
    const u = new URLSearchParams();
    if (status) u.set('status', status);
    if (q) u.set('q', q);
    u.set('page', String(p));
    return `/admin?${u}`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Quản lý shop</h1>
        <Link href="/admin/settings" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm">
          Cài đặt
        </Link>
      </div>

      {s && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Doanh thu (đơn hoàn tất)" value={vnd(s.revenue)} />
          <Stat label="Lãi ước tính" value={vnd(s.profit)} />
          <Stat label="Đơn hôm nay" value={String(s.ordersToday)} />
          <Stat
            label="Ví nhà cung cấp"
            value={s.providerWallet ? `${s.providerWallet.wallet.toLocaleString('vi-VN')} ${s.providerWallet.currency}` : 'không đọc được'}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href="/admin" className={`rounded-full border px-3 py-1 ${!status ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white'}`}>
          Tất cả{s ? ` (${s.totalOrders})` : ''}
        </Link>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <Link
            key={k}
            href={`/admin?status=${k}`}
            className={`rounded-full border px-3 py-1 ${status === k ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white'}`}
          >
            {v.text}
            {s?.counts[k] ? ` (${s.counts[k]})` : ''}
          </Link>
        ))}
      </div>

      <form className="flex gap-2" action="/admin">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm mã đơn, UDID, tên đăng nhập..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Tìm</button>
      </form>

      {items.length === 0 && <p className="text-sm text-slate-500">Không có đơn nào.</p>}
      {items.map((o) => (
        <div key={o.code} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <Link href={`/orders/${o.code}`} className="min-w-0">
            <div className="font-medium">
              {o.code} · {o.planTitle} · {vnd(o.price)}
            </div>
            <div className="truncate text-xs text-slate-500">
              {o.username} · <span className="font-mono">{o.udid}</span> · {new Date(o.createdAt).toLocaleString('vi-VN')}
            </div>
            {o.error && <div className="text-xs text-red-600">{o.error}</div>}
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <OrderStatus status={o.status} />
            {o.status === 'awaiting_payment' && (
              <>
                <AdminConfirm code={o.code} action="confirm" label="Đã nhận tiền" />
                <AdminConfirm code={o.code} action="cancel" label="Hủy" />
              </>
            )}
            {o.status === 'paid' && <AdminConfirm code={o.code} action="confirm" label="Gửi lại đơn" />}
          </div>
        </div>
      ))}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={link(page - 1)}>← Trước</Link>}
          <span className="text-slate-500">
            Trang {page}/{pages}
          </span>
          {page < pages && <Link href={link(page + 1)}>Sau →</Link>}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-base font-bold">{value}</div>
    </div>
  );
}
