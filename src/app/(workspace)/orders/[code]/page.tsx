import { notFound, redirect } from 'next/navigation';
import { be, getMe, type AppInfo } from '@/lib/api';
import AppDownload from '@/components/AppDownload';
import OrderDetailView from '@/components/OrderDetailView';

export const dynamic = 'force-dynamic';

interface Order {
  code: string;
  udid: string;
  planTitle: string;
  price: number;
  status: string;
  hasProvider: boolean;
  p12Password?: string;
  payment?: {
    bankId: string;
    accountNo: string;
    accountName: string;
    amount: number;
    content: string;
    qrUrl: string;
  };
}

export default async function OrderPage({ params }: PageProps<'/orders/[code]'>) {
  if (!(await getMe())) redirect('/login');
  const { code } = await params;
  const r = await be<Order>(`/orders/${encodeURIComponent(code)}`);
  if (!r.ok) notFound();
  const order = r.data;
  // Thẻ tải app chỉ cần khi chứng chỉ đã sẵn sàng
  const app = order.status === 'completed' ? await be<AppInfo>('/app') : null;

  return (
    <div>
      <OrderDetailView order={order} />
      {app?.ok && (
        <div className="mt-5">
          <AppDownload app={app.data} />
        </div>
      )}
    </div>
  );
}
