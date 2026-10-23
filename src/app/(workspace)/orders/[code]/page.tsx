import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { be, getMe, type AppInfo } from '@/lib/api';
import AppDownload from '@/components/AppDownload';
import { Use } from '@/components/IconSprite';
import OrderActions from '@/components/OrderActions';
import { Badge, Card, InfoRow, Message } from '@/components/ui';

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

  const pending = order.status === 'awaiting_payment';
  const active = order.status === 'completed';
  const step = pending ? 1 : active ? 3 : 2;

  return (
    <div>
      <div className="mb-[29px] flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="mb-[9px] text-2xl font-bold tracking-tight sm:text-[29px] sm:tracking-[-1.1px]">Đơn {order.code}</h1>
          <p className="text-[11px] text-muted">
            <Link href="/orders">← Đơn hàng của tôi</Link>
          </p>
        </div>
        <Badge status={order.status} />
      </div>

      {order.status !== 'failed' && order.status !== 'cancelled' && (
        <Card className="mb-5 flex items-center gap-3 overflow-auto">
          {['Thanh toán', 'Nhận chứng chỉ', 'Cài ứng dụng'].map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            return (
              <div key={label} className="flex shrink-0 items-center gap-2.5">
                <span className={`flex items-center gap-2.5 text-[10px] ${current ? 'font-semibold text-ink' : done ? 'text-[#709442]' : 'text-[#a2ae96]'}`}>
                  <b
                    className={`grid h-[25px] w-[25px] place-items-center rounded-full text-[9px] font-medium ${
                      current ? 'bg-deep text-lime' : done ? 'bg-[#e6f0d7]' : 'bg-[#f1f5e9]'
                    }`}
                  >
                    {done ? '✓' : n}
                  </b>
                  {label}
                </span>
                {i < 2 && <span className="h-px w-8 bg-line" />}
              </div>
            );
          })}
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Card>
            <div className="mb-[22px] flex items-center justify-between">
              <h2 className="text-[15px] tracking-[-0.4px]">Thông tin đơn hàng</h2>
              <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#e5efce] text-[#719b3f]">
                <Use id="i-orders" className="icon h-[18px] w-[18px]" />
              </span>
            </div>
            <InfoRow k="Gói chứng chỉ" v={order.planTitle} />
            <InfoRow k="UDID" v={order.udid} mono />
            <InfoRow k="Tổng thanh toán" v={`${order.price.toLocaleString('vi-VN')}đ`} />
            {order.p12Password && <InfoRow k="Mật khẩu .p12" v={order.p12Password} mono />}
          </Card>
        </div>

        <Card>
          <div className="mb-[22px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">{active ? 'Sẵn sàng trải nghiệm' : pending ? 'Thanh toán chuyển khoản' : 'Đang chuẩn bị chứng chỉ'}</h2>
            <Use id={active ? 'i-check' : pending ? 'i-clock' : 'i-sign'} className="icon h-5 w-5 text-[#88a268]" />
          </div>

          {pending && pay && (
            <div className="space-y-3">
              {pay.qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pay.qrUrl} alt="VietQR" className="mx-auto w-56 rounded-lg" />
              ) : (
                <p className="text-[11px] text-[#b45b45]">Chưa cấu hình tài khoản ngân hàng.</p>
              )}
              <InfoRow k="Ngân hàng" v={pay.bankId} />
              <InfoRow k="Số tài khoản" v={pay.accountNo} mono />
              <InfoRow k="Chủ tài khoản" v={pay.accountName} />
              <InfoRow k="Số tiền" v={`${pay.amount.toLocaleString('vi-VN')}đ`} />
              <InfoRow k="Nội dung" v={pay.content} mono />
              <Message amber>Chuyển đúng số tiền và nội dung. Đơn sẽ được xử lý sau khi admin nhận được tiền.</Message>
            </div>
          )}
          {(order.status === 'paid' || order.status === 'provisioning') && (
            <Message>Đã nhận thanh toán, đang xử lý chứng chỉ. Trang tự cập nhật, không cần tải lại.</Message>
          )}
          {order.status === 'failed' && <Message amber>Xử lý thất bại. Vui lòng liên hệ admin kèm mã đơn {order.code}.</Message>}

          {active && (
            <div className="mt-4">
              <OrderActions code={order.code} status={order.status} hasProvider={order.hasProvider} />
            </div>
          )}
          <p className="mt-4 text-[9px] text-muted">
            Cần hỗ trợ?{' '}
            <a href="https://t.me/metusvn" target="_blank" rel="noreferrer">
              Liên hệ Metus qua Telegram ↗
            </a>
          </p>
        </Card>
      </div>

      {app?.ok && (
        <div className="mt-5">
          <AppDownload app={app.data} />
        </div>
      )}
    </div>
  );
}
