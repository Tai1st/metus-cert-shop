import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import OrdersTable from '@/components/OrdersTable';
import OrdersPageHead from '@/components/OrdersPageHead';
import { Card } from '@/components/ui';

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

export default async function OrdersPage() {
  if (!(await getMe())) redirect('/login?next=/orders');
  const r = await be<{ orders: OrderRow[] }>('/orders');
  const orders = r.ok ? r.data.orders : [];

  return (
    <div>
      <OrdersPageHead />
      <Card>
        <OrdersTable orders={orders} />
      </Card>
    </div>
  );
}
