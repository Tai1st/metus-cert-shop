import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import DashboardView from '@/components/DashboardView';

export const dynamic = 'force-dynamic';

interface OrderRow {
  code: string;
  planTitle: string;
  udid: string;
  device: string;
  price: number;
  status: string;
  createdAt: string;
}

const PENDING = new Set(['awaiting_payment', 'paid', 'provisioning']);

export default async function DashboardPage() {
  const user = await getMe();
  if (!user) redirect('/login?next=/dashboard');
  const r = await be<{ orders: OrderRow[] }>('/orders');
  const orders = r.ok ? r.data.orders : [];
  const completed = orders.filter((o) => o.status === 'completed');
  const pending = orders.filter((o) => PENDING.has(o.status));

  return <DashboardView orders={orders} completed={completed} pending={pending} latestCert={completed[0]} />;
}
