import { redirect } from 'next/navigation';
import { be, getMe, type Plan } from '@/lib/api';
import BuyForm from '@/components/BuyForm';

export const dynamic = 'force-dynamic';

export default async function BuyPage({ searchParams }: PageProps<'/buy'>) {
  if (!(await getMe())) redirect('/login');

  const e = (await searchParams).e;
  const token = typeof e === 'string' ? e : '';
  const enroll = token
    ? await be<{ udid: string; product?: string; version?: string }>(`/udid/enroll/${encodeURIComponent(token)}`)
    : null;

  if (!enroll?.ok) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Bước 1: Lấy UDID iPhone/iPad</h1>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Mở trang này bằng <b>Safari</b> trên chính thiết bị cần cài app.</li>
          <li>Bấm nút bên dưới, chọn <b>Cho phép</b> khi được hỏi tải hồ sơ cấu hình.</li>
          <li>Vào <b>Cài đặt → Đã tải về hồ sơ → Cài đặt</b>.</li>
          <li>Sau khi cài, Safari tự mở lại trang này với UDID của bạn.</li>
        </ol>
        <a href="/api/cert-shop/udid/profile" className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white">
          Tải hồ sơ lấy UDID
        </a>
      </div>
    );
  }

  const plans = await be<{ plans: Plan[] }>('/plans');
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="text-slate-500">UDID của bạn</div>
        <div className="break-all font-mono">{enroll.data.udid}</div>
        <div className="text-slate-500">
          {enroll.data.product} · iOS {enroll.data.version}
        </div>
      </div>
      <BuyForm enrollToken={token} plans={plans.ok ? plans.data.plans : []} />
    </div>
  );
}
