import Link from 'next/link';
import { redirect } from 'next/navigation';
import { be, getMe, vnd, type AppInfo } from '@/lib/api';
import AdminAppUpload from '@/components/AdminAppUpload';
import AdminConfirm from '@/components/AdminConfirm';
import { Use } from '@/components/IconSprite';
import { Badge, Card, PageHead, Stat } from '@/components/ui';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  provisioning: 'Đang cấp chứng chỉ',
  completed: 'Hoạt động',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

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

  const [stats, list, app] = await Promise.all([
    be<Stats>('/admin/stats'),
    be<{ total: number; items: Row[] }>(`/admin/orders?${qs}`),
    be<AppInfo>('/admin/app'),
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
    <div>
      <PageHead
        title="Quản lý shop"
        sub="Đơn hàng, doanh thu và ứng dụng phát hành."
        action={
          <Link href="/admin/settings" className="rounded-[9px] border border-line bg-white px-4 py-3 text-[10px] font-semibold hover:bg-[#f3f6ed]">
            Cài đặt
          </Link>
        }
      />

      {s && (
        <div className="mb-[22px] grid grid-cols-2 gap-[15px] lg:grid-cols-4">
          <Stat icon={<Use id="i-zap" className="icon h-[15px] w-[15px]" />} title="Doanh thu" value={vnd(s.revenue)} caption="Đơn đã hoàn tất" />
          <Stat icon={<Use id="i-check" className="icon h-[15px] w-[15px]" />} title="Lãi ước tính" value={vnd(s.profit)} caption="Sau giá nhập" />
          <Stat icon={<Use id="i-clock" className="icon h-[15px] w-[15px]" />} title="Đơn hôm nay" value={String(s.ordersToday)} caption="Tính theo giờ server" />
          <Stat
            icon={<Use id="i-shield" className="icon h-[15px] w-[15px]" />}
            title="Ví nhà cung cấp"
            value={s.providerWallet ? `${s.providerWallet.wallet.toLocaleString('vi-VN')} ${s.providerWallet.currency}` : '—'}
            caption="chungchi.store"
          />
        </div>
      )}

      <div className="mb-[22px]">
        <AdminAppUpload app={app.ok ? app.data : { available: false }} />
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2 text-[9px]">
          <Link href="/admin" className={`rounded-full border px-3 py-1.5 ${!status ? 'border-[#9fbc77] bg-[#f0f7e7] text-[#537638]' : 'border-line bg-white'}`}>
            Tất cả{s ? ` (${s.totalOrders})` : ''}
          </Link>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <Link
              key={k}
              href={`/admin?status=${k}`}
              className={`rounded-full border px-3 py-1.5 ${status === k ? 'border-[#9fbc77] bg-[#f0f7e7] text-[#537638]' : 'border-line bg-white'}`}
            >
              {v}
              {s?.counts[k] ? ` (${s.counts[k]})` : ''}
            </Link>
          ))}
        </div>

        <form className="mb-5 flex gap-2" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm mã đơn, UDID, tên đăng nhập..."
            className="min-h-[43px] flex-1 rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-[10px] outline-none focus:border-[#9cba72]"
          />
          <button className="rounded-[9px] bg-deep px-4 text-[10px] font-semibold text-white hover:bg-deep-dark">Tìm</button>
        </form>

        {items.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-muted">Không có đơn nào.</p>
        ) : (
          <div className="space-y-2.5">
            {items.map((o) => (
              <div key={o.code} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 text-[11px]">
                <Link href={`/orders/${o.code}`} className="min-w-0">
                  <div className="font-semibold">
                    {o.code} · {o.planTitle} · {vnd(o.price)}
                  </div>
                  <div className="truncate text-[9px] text-muted">
                    {o.username} · <span className="font-mono">{o.udid}</span> · {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </div>
                  {o.error && <div className="text-[9px] text-[#b45b45]">{o.error}</div>}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge status={o.status} />
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
          </div>
        )}

        {pages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3 text-[10px]">
            {page > 1 && <Link href={link(page - 1)}>← Trước</Link>}
            <span className="text-muted">
              Trang {page}/{pages}
            </span>
            {page < pages && <Link href={link(page + 1)}>Sau →</Link>}
          </div>
        )}
      </Card>
    </div>
  );
}
