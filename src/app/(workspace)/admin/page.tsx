import { redirect } from 'next/navigation';
import { be, getMe, type AppInfo } from '@/lib/api';
import AdminView from '@/components/AdminView';

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

  return <AdminView stats={s} items={items} total={total} pages={pages} page={page} status={status} q={q} app={app} link={link} />;
}
