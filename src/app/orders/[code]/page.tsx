import { notFound, redirect } from 'next/navigation';
import { be, getMe, type AppInfo } from '@/lib/api';
import AppDownload from '@/components/AppDownload';
import OrderActions from '@/components/OrderActions';
import OrderStatus from '@/components/OrderStatus';

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
  const pay = order.payment;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Đơn {order.code}</h1>
        <OrderStatus status={order.status} />
      </div>

      {order.status !== 'failed' && order.status !== 'cancelled' && (
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-white p-4 text-[11px]">
          {['Thanh toán', 'Nhận chứng chỉ', 'Cài ứng dụng'].map((label, i) => {
            // 1 = chờ thanh toán, 2 = đang cấp chứng chỉ, 3 = đã có chứng chỉ, sẵn sàng cài app
            const now = order.status === 'awaiting_payment' ? 1 : order.status === 'completed' ? 3 : 2;
            const done = i + 1 < now;
            return (
              <div key={label} className="flex flex-1 items-center gap-1.5 last:flex-none">
                <b
                  className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10px] ${
                    i + 1 === now ? 'bg-ink text-white' : done ? 'bg-mint text-[#20321a]' : 'bg-[#edf0eb] text-[#9aab99]'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </b>
                <span className={i + 1 === now ? 'font-semibold' : 'text-muted'}>{label}</span>
                {i < 2 && <i className="h-px flex-1 bg-line" />}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <Row k="Gói" v={order.planTitle} />
        <Row k="UDID" v={order.udid} mono />
        <Row k="Giá" v={`${order.price.toLocaleString('vi-VN')}đ`} />
        {order.p12Password && <Row k="Mật khẩu .p12" v={order.p12Password} mono />}
      </div>

      {pay && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">Thanh toán chuyển khoản</h2>
          {pay.qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pay.qrUrl} alt="VietQR" className="mx-auto w-64 rounded-lg" />
          ) : (
            <p className="text-red-600">Chưa cấu hình tài khoản ngân hàng.</p>
          )}
          <Row k="Ngân hàng" v={pay.bankId} />
          <Row k="Số tài khoản" v={pay.accountNo} mono />
          <Row k="Chủ tài khoản" v={pay.accountName} />
          <Row k="Số tiền" v={`${pay.amount.toLocaleString('vi-VN')}đ`} />
          <Row k="Nội dung" v={pay.content} mono />
          <p className="text-slate-500">Chuyển đúng số tiền và nội dung. Đơn sẽ được xử lý sau khi admin nhận được tiền.</p>
        </div>
      )}

      {(order.status === 'paid' || order.status === 'provisioning') && (
        <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Đã nhận thanh toán, đang xử lý chứng chỉ. Trang tự cập nhật, không cần tải lại.
        </p>
      )}
      {order.status === 'failed' && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          Xử lý thất bại. Vui lòng liên hệ admin kèm mã đơn {order.code}.
        </p>
      )}

      <OrderActions code={order.code} status={order.status} hasProvider={order.hasProvider} />
      {app?.ok && <AppDownload app={app.data} />}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{k}</span>
      <span className={`break-all text-right font-medium ${mono ? 'font-mono' : ''}`}>{v}</span>
    </div>
  );
}
