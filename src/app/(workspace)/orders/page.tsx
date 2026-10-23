import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import OrdersTable from '@/components/OrdersTable';
import { BtnLink, Card, PageHead } from '@/components/ui';

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
      <PageHead
        title="Đơn hàng của tôi"
        sub="Theo dõi chứng chỉ, thanh toán và tiến trình cài đặt."
        action={<BtnLink href="/#install">+ &nbsp; Tạo đơn mới</BtnLink>}
      />
      <Card>
        <OrdersTable orders={orders} />
      </Card>
    </div>
  );
}
