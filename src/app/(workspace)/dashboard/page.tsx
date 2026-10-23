import Link from 'next/link';
import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import { Use } from '@/components/IconSprite';
import { Badge, BtnLink, Card, PageHead, Stat } from '@/components/ui';

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

const QUICK = [
  { href: '/sign', icon: 'i-sign', t: 'Ký IPA mới', d: 'Tùy chỉnh và cài ứng dụng' },
  { href: '/check', icon: 'i-check', t: 'Kiểm tra chứng chỉ', d: 'Xem trạng thái và thời hạn' },
  { href: '/lookup', icon: 'i-lookup', t: 'Tra cứu đơn hàng', d: 'Tìm nhanh bằng mã đơn' },
] as const;

export default async function DashboardPage() {
  const user = await getMe();
  if (!user) redirect('/login?next=/dashboard');
  const r = await be<{ orders: OrderRow[] }>('/orders');
  const orders = r.ok ? r.data.orders : [];
  const completed = orders.filter((o) => o.status === 'completed');
  const pending = orders.filter((o) => PENDING.has(o.status));
  const latestCert = completed[0];

  return (
    <div>
      <PageHead
        title="Chào bạn, bắt đầu thôi."
        sub="Mọi ứng dụng, thiết bị và chứng chỉ — trong một không gian."
        action={<BtnLink href="/#install">+ &nbsp; Mua chứng chỉ</BtnLink>}
      />

      <div className="mb-[23px] grid grid-cols-2 gap-[15px] lg:grid-cols-4">
        <Stat icon={<Use id="i-orders" className="icon h-[15px] w-[15px]" />} title="Tổng đơn hàng" value={String(orders.length)} caption="Tất cả đơn hàng của bạn" />
        <Stat icon={<Use id="i-check" className="icon h-[15px] w-[15px]" />} title="Chứng chỉ hoạt động" value={String(completed.length)} caption="Đã sẵn sàng sử dụng" />
        <Stat icon={<Use id="i-phone" className="icon h-[15px] w-[15px]" />} title="Thiết bị đăng ký" value={String(orders.length)} caption="iPhone và iPad của bạn" />
        <Stat icon={<Use id="i-clock" className="icon h-[15px] w-[15px]" />} title="Chờ xử lý" value={String(pending.length)} caption="Thanh toán và cấp chứng chỉ" />
      </div>

      <div className="mb-[22px] grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative min-h-[195px] overflow-hidden rounded-[17px] bg-deep p-7 text-white">
          <div className="pointer-events-none absolute -bottom-[140px] -right-[50px] h-[300px] w-[300px] rounded-full border border-[#c5df9420] shadow-[0_0_0_35px_#c5df9408,0_0_0_70px_#c5df9406]" />
          <div className="relative text-[8px] font-semibold tracking-[1.6px] text-[#9baf89]">METUS BROWSER / iOS</div>
          <h2 className="relative my-3.5 text-[23px] leading-[1.4] tracking-[-0.8px] sm:text-[25px]">
            Mở rộng trải nghiệm.
            <br />
            Ngay trên iPhone của bạn.
          </h2>
          <p className="relative mb-5 max-w-[350px] text-[10px] leading-[1.8] text-[#a8bc98]">
            Chứng chỉ đã sẵn sàng? Khám phá kho ứng dụng và tiếp tục trải nghiệm theo cách của bạn.
          </p>
          <Link href="/apps" className="relative inline-flex items-center gap-2.5 rounded-[9px] bg-lime px-4 py-3 text-[10px] font-semibold text-[#2b461a] hover:bg-lime-dark">
            Khám phá kho ứng dụng <Use id="i-arrow" className="icon h-[15px] w-[15px]" />
          </Link>
        </div>

        <Card className="bg-gradient-to-[130deg] from-[#f1f7e8] to-white">
          <div className="mb-[18px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">Chứng chỉ của bạn</h2>
            {latestCert && <Badge status="completed" />}
          </div>
          {latestCert ? (
            <>
              <div className="my-[18px] flex items-center gap-3">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#e5efce] text-[#719b3f]">
                  <Use id="i-check" className="icon h-[18px] w-[18px]" />
                </span>
                <div>
                  <strong className="text-sm">{latestCert.planTitle}</strong>
                  <small className="mt-1.5 block text-[9px] text-[#8d9c7c]">{latestCert.device} · {latestCert.udid}</small>
                </div>
              </div>
              <Link href={`/orders/${latestCert.code}`} className="text-[9px] text-[#809368]">
                Xem thông tin chứng chỉ ↗
              </Link>
            </>
          ) : (
            <p className="py-6 text-center text-[10px] leading-[1.8] text-muted">Bạn chưa có chứng chỉ hoạt động nào.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-[22px] flex items-center justify-between">
          <h2 className="text-[15px] tracking-[-0.4px]">Đơn hàng gần đây</h2>
          <Link href="/orders" className="text-[9px] text-[#809368]">
            Xem tất cả ↗
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-muted">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">MÃ ĐƠN</th>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">GÓI</th>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">THANH TOÁN</th>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.code} className="border-b border-[#f0f3eb] last:border-0">
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">
                      <Link href={`/orders/${o.code}`} className="font-semibold">
                        {o.code}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">{o.planTitle}</td>
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">{o.price.toLocaleString('vi-VN')}đ</td>
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">
                      <Badge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-[21px] grid gap-[15px] sm:grid-cols-3">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="flex items-center gap-3 rounded-[13px] border border-line bg-white p-[21px] hover:bg-[#f0f6e8]">
            <Use id={q.icon} className="icon h-5 w-5 text-[#88a268]" />
            <span>
              <strong className="block text-[11px]">{q.t}</strong>
              <small className="mt-[5px] block text-[8px] text-[#a1ad94]">{q.d}</small>
            </span>
            <span className="ml-auto text-[#a9b49f]">↗</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
