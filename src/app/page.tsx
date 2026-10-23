import Link from 'next/link';
import { be, vnd, type Plan } from '@/lib/api';

export const dynamic = 'force-dynamic';

const STEPS = [
  { t: 'Đăng ký tài khoản', d: 'Tạo tài khoản để lưu đơn và tải lại chứng chỉ bất cứ lúc nào.' },
  { t: 'Lấy UDID', d: 'Mở bằng Safari trên iPhone/iPad, cài hồ sơ cấu hình để hệ thống đọc UDID.' },
  { t: 'Chọn gói & thanh toán', d: 'Quét QR VietQR, nội dung chuyển khoản đã được điền sẵn.' },
  { t: 'Tải chứng chỉ', d: 'Hệ thống xử lý tự động, bạn tải file .zip ngay trên trang đơn.' },
];

const TRUST = [
  { t: 'Giao tự động', d: 'Sau khi xác nhận thanh toán, đơn được gửi xử lý ngay, trang tự cập nhật.' },
  { t: 'Có bảo hành', d: 'Chứng chỉ lỗi hoặc bị thu hồi trong thời gian bảo hành được hỗ trợ xử lý.' },
  { t: 'Kiểm tra trực tiếp', d: 'Bấm một nút để kiểm tra chứng chỉ còn hợp lệ hay đã bị thu hồi.' },
  { t: 'Bảo mật thông tin', d: 'Chỉ lưu UDID và mật khẩu .p12 của đơn, không yêu cầu Apple ID của bạn.' },
  { t: 'Hỗ trợ nhanh', d: 'Liên hệ qua Telegram kèm mã đơn để được xử lý ưu tiên.' },
];

const FAQ = [
  { q: 'UDID là gì, lấy ở đâu?', a: 'UDID là mã định danh duy nhất của thiết bị. Bạn chỉ cần mở trang Mua chứng chỉ bằng Safari và cài hồ sơ cấu hình, hệ thống tự đọc UDID, không phải nhập tay.' },
  { q: 'Chứng chỉ dùng để làm gì?', a: 'Dùng để ký và cài ứng dụng Metus Browser trên đúng thiết bị có UDID đã đăng ký.' },
  { q: 'Mất bao lâu để nhận?', a: 'Thời gian nhận ghi trên từng gói. Sau khi thanh toán được xác nhận, trang đơn sẽ tự cập nhật khi chứng chỉ sẵn sàng.' },
  { q: 'Một chứng chỉ dùng được cho mấy thiết bị?', a: 'Mỗi đơn gắn với một UDID. Thiết bị khác cần mua đơn riêng.' },
  { q: 'Nếu chứng chỉ bị lỗi thì sao?', a: 'Vào trang đơn, bấm "Kiểm tra chứng chỉ" hoặc "Yêu cầu bảo hành". Nếu cần hỗ trợ, liên hệ Telegram kèm mã đơn.' },
  { q: 'Thanh toán bằng cách nào?', a: 'Hiện hỗ trợ chuyển khoản ngân hàng qua VietQR. Thanh toán USDT sẽ được bổ sung sau.' },
];

export default async function Home() {
  const r = await be<{ plans: Plan[] }>('/plans');
  const plans = r.ok ? r.data.plans : [];
  return (
    <div className="space-y-16">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-14 text-center text-white sm:px-12">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">Dành cho Metus Browser trên iOS</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          Mua chứng chỉ cài Metus Browser trên iPhone, iPad
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          Lấy UDID, thanh toán, tải chứng chỉ tự động. Mọi bước làm ngay trên điện thoại của bạn.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/buy" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
            Mua chứng chỉ ngay
          </Link>
          <Link href="/#huong-dan" className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10">
            Xem hướng dẫn
          </Link>
        </div>
      </section>

      <section id="bang-gia" className="space-y-6">
        <SectionTitle title="Chọn gói chứng chỉ" sub="Giá đã gồm xử lý tự động và bảo hành theo từng gói." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="text-sm font-medium text-indigo-600">{p.title}</div>
              <div className="mt-2 text-3xl font-bold">{vnd(p.price)}</div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                {p.receiveTime && <Li>Thời gian nhận: {p.receiveTime}</Li>}
                {p.validity && <Li>Hạn dùng: {p.validity}</Li>}
                {p.warranty && <Li>Bảo hành: {p.warranty}</Li>}
                <Li>iPhone &amp; iPad</Li>
              </ul>
              <Link href="/buy" className="mt-6 block rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700">
                Mua gói này
              </Link>
            </div>
          ))}
          {plans.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Chưa tải được danh sách gói. Vui lòng thử lại sau.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          Thanh toán:
          <Chip>Chuyển khoản VietQR</Chip>
          <Chip muted>USDT (sắp có)</Chip>
        </div>
      </section>

      <section id="huong-dan" className="space-y-6">
        <SectionTitle title="Quy trình 4 bước" sub="Không cần máy tính, làm hoàn toàn trên iPhone/iPad." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{i + 1}</div>
              <div className="mt-3 font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="Vì sao chọn chúng tôi" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.t} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="font-semibold">{t.t}</div>
              <p className="mt-1 text-sm text-slate-600">{t.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-3xl space-y-6">
        <SectionTitle title="Câu hỏi thường gặp" />
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="ml-4 text-indigo-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-indigo-600">✓</span>
      <span>{children}</span>
    </li>
  );
}

function Chip({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`rounded-full border px-3 py-1 ${muted ? 'border-slate-200 text-slate-400' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
      {children}
    </span>
  );
}
