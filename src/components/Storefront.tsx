'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { post } from '@/lib/client';
import type { Plan } from '@/lib/api';
import UdidGuide from './UdidGuide';

interface Enroll {
  token: string;
  udid: string;
  product?: string;
  version?: string;
}

const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const DEFAULT_FEATURES = [
  'Phù hợp mọi thiết bị, mọi OS.',
  'Hỗ trợ App group, thông báo đẩy, VPN/network, Siri...',
  'Cài và nhân bản app không giới hạn.',
];

const STEPS = [
  { t: 'Đăng ký thiết bị', d: 'Tạo tài khoản và lấy UDID của iPhone cần cài.' },
  { t: 'Thanh toán & nhận chứng chỉ', d: 'Theo dõi trạng thái chứng chỉ ngay trên trang đơn.' },
  { t: 'Cài Metus Browser', d: 'Tải chứng chỉ và làm theo hướng dẫn trên Safari.' },
];

const FAQ = [
  {
    q: 'UDID là gì và lấy ở đâu?',
    a: 'UDID là mã nhận dạng thiết bị iOS, dùng để đăng ký thiết bị cho chứng chỉ. Bấm “Lấy UDID” trên iPhone bằng Safari, hệ thống tự đọc mã, bạn không cần nhập tay.',
  },
  {
    q: 'Tôi đã có chứng chỉ, có cần mua lại không?',
    a: 'Mỗi đơn gắn với một UDID cụ thể. Nếu chứng chỉ hiện có còn hoạt động và đúng thiết bị thì không cần mua lại. Liên hệ hỗ trợ nếu bạn không chắc.',
  },
  {
    q: 'Nếu chứng chỉ không còn hoạt động thì sao?',
    a: 'Vào trang đơn, bấm “Kiểm tra chứng chỉ”, và “Yêu cầu bảo hành” nếu còn trong thời hạn bảo hành của gói. Cần hỗ trợ thêm, liên hệ Telegram kèm mã đơn.',
  },
  {
    q: 'Thanh toán bằng cách nào?',
    a: 'Hiện hỗ trợ chuyển khoản ngân hàng qua mã VietQR, nội dung chuyển khoản đã điền sẵn. Thanh toán USDT sẽ được bổ sung sau.',
  },
];

export default function Storefront({
  plans,
  loggedIn,
  enroll,
}: {
  plans: Plan[];
  loggedIn: boolean;
  enroll: Enroll | null;
}) {
  const router = useRouter();
  const sorted = useMemo(() => [...plans].sort((a, b) => a.price - b.price), [plans]);
  // Gói đề xuất: gói cao thứ hai khi có từ 3 gói trở lên
  const recommended = sorted.length >= 3 ? sorted[sorted.length - 2].id : '';
  const [selected, setSelected] = useState(recommended || sorted[0]?.id || '');
  const [guide, setGuide] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const plan = sorted.find((p) => p.id === selected);
  const current = !loggedIn ? 1 : !enroll ? 2 : 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll || !plan) return;
    setBusy(true);
    setError('');
    const r = await post<{ code: string }>('/orders', { enrollToken: enroll.token, planId: plan.id });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    router.push(`/orders/${r.data.code}`);
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[2px]">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#87b844]" /> METUS BROWSER FOR iOS
          </div>
          <h1 className="mb-2.5 mt-3.5 text-[30px] font-bold leading-[1.25] tracking-[-1.5px] sm:text-[38px]">
            Trải nghiệm Metus.
            <br />
            Cài đặt theo cách của bạn.
          </h1>
          <p className="leading-[1.8] text-muted">Chọn chứng chỉ, đăng ký thiết bị và cài đặt ứng dụng trong một nơi.</p>
        </div>
        <div className="self-start rounded-full border border-line bg-white px-3.5 py-[11px] text-[11px] sm:self-auto">
          ◉ &nbsp; Dành cho iPhone &amp; iPad
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <section>
          {/* Hero */}
          <div className="relative flex min-h-[270px] items-center overflow-hidden rounded-[22px] bg-[#122b2c] p-6 text-white sm:min-h-[290px] sm:p-8">
            <div className="pointer-events-none absolute -right-5 h-80 w-80 rounded-full border border-[#b7d49325] shadow-[0_0_0_46px_#b7d49308,0_0_0_92px_#b7d49306]" />
            <div className="relative z-10 w-[63%] sm:w-[59%]">
              <span className="inline-flex items-center gap-[7px] rounded-[20px] border border-[#ffffff14] bg-[#ffffff10] px-2.5 py-[7px] text-[10px] text-[#d7e4dc]">
                <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#87b844]" /> Trình duyệt của Metus
              </span>
              <h2 className="mb-2.5 mt-5 text-[27px] font-bold leading-[1.2] tracking-tight sm:text-[32px]">
                Một trình duyệt.
                <br />
                Nhiều khả năng hơn.
              </h2>
              <p className="text-xs leading-[1.8] text-[#acc1b8]">
                Đưa trải nghiệm Metus lên iPhone của bạn.
                <br />
                Sẵn sàng bắt đầu ngay trên thiết bị.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#d8e5db]">
                <span>↗ &nbsp; Cài đặt trực tiếp</span>
                <span>◈ &nbsp; Ký theo thiết bị</span>
                <span>↻ &nbsp; Quản lý dễ dàng</span>
              </div>
            </div>
            <div className="absolute right-[22px] top-[82px] grid h-[90px] w-[90px] -rotate-[9deg] place-items-center rounded-[23px] bg-gradient-to-br from-[#ddff99] to-[#a4d84c] shadow-[0_24px_50px_#0006,inset_0_2px_1px_#ffffffa0] sm:right-[51px] sm:top-[60px] sm:h-32 sm:w-32 sm:rounded-[30px]">
              <svg viewBox="0 0 100 100" fill="none" className="h-[65px] w-[65px] rotate-[9deg] sm:h-[86px] sm:w-[86px]">
                <circle cx="50" cy="50" r="33" stroke="#19382b" strokeWidth="3" />
                <ellipse cx="50" cy="50" rx="17" ry="33" stroke="#19382b" strokeWidth="2" />
                <path d="M18 40h64M18 60h64" stroke="#19382b" strokeWidth="2" />
                <path d="M28 65V39l11 13 11-13 11 13 11-13v26" stroke="#19382b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Gói */}
          <div id="install" className="mb-[17px] mt-8 flex items-center justify-between scroll-mt-6">
            <h2 className="text-lg font-bold tracking-tight">01 &nbsp; Chọn gói chứng chỉ</h2>
            <span className="text-[11px] text-muted">1 thiết bị / gói</span>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {sorted.map((p) => {
              const on = p.id === selected;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(p.id)}
                  className={`relative rounded-[15px] border bg-white p-[21px] text-left transition ${
                    on ? 'border-[1.5px] border-[#4f733d] bg-tint shadow-[0_0_0_2px_#b9da9430]' : 'border-line hover:border-[#c9d4c4]'
                  }`}
                >
                  {p.id === recommended && (
                    <span className="absolute -top-2.5 right-3 rounded-[5px] bg-mint px-2 py-[5px] text-[9px] font-bold">GÓI ĐỀ XUẤT</span>
                  )}
                  <div className="flex items-center gap-[9px] text-[13px] font-bold">
                    <span className={`grid h-4 w-4 place-items-center rounded-full border ${on ? 'border-[#587641]' : 'border-[#bdc8bd]'}`}>
                      {on && <span className="h-2 w-2 rounded-full bg-[#587641]" />}
                    </span>
                    {p.title.replace(/^Gói\s+/i, '')}
                  </div>
                  <div className="mb-[7px] mt-[18px] text-[27px] font-bold tracking-[-1px]">
                    {vnd(p.price)}
                    {/12\s*tháng/i.test(p.validity) && <small className="ml-1 text-[11px] font-normal tracking-normal text-muted">/ năm</small>}
                  </div>
                  <div className="mt-[15px] space-y-1.5 border-t border-line pt-3 text-[10px] leading-[1.9] text-muted">
                    <div><span className="mr-1.5 text-[#6d9644]">✓</span> Đăng ký 1 thiết bị iOS</div>
                    {p.receiveTime && <div><span className="mr-1.5 text-[#6d9644]">✓</span> {p.receiveTime}</div>}
                    {p.validity && <div><span className="mr-1.5 text-[#6d9644]">✓</span> {p.validity}</div>}
                    {p.warranty && <div><span className="mr-1.5 text-[#6d9644]">✓</span> {p.warranty}</div>}
                  </div>
                  <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[10px] leading-[1.7] text-ink">
                    {(p.features?.length ? p.features : DEFAULT_FEATURES).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
            {sorted.length === 0 && (
              <p className="col-span-full rounded-2xl border border-dashed border-[#cfd8cc] bg-white p-8 text-center text-xs text-muted">
                Chưa tải được danh sách gói. Vui lòng thử lại sau.
              </p>
            )}
          </div>

          {/* Quy trình */}
          <div id="guide" className="mb-[17px] mt-8 scroll-mt-6">
            <h2 className="text-lg font-bold tracking-tight">Từ đăng ký đến sẵn sàng sử dụng</h2>
          </div>
          <div className="mb-7 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.t} className="flex gap-2.5">
                <span className="grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border border-[#dce3d8] text-[10px]">{i + 1}</span>
                <div>
                  <strong className="mb-1.5 mt-1 block text-[11px]">{s.t}</strong>
                  <p className="text-[10px] leading-[1.6] text-muted">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div id="faq" className="mb-[17px] mt-8 flex items-center justify-between scroll-mt-6">
            <h2 className="text-lg font-bold tracking-tight">Bạn cần biết thêm?</h2>
            <span className="text-[11px] text-muted">Giải đáp trước khi cài đặt</span>
          </div>
          <div>
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-line py-[18px]">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs">
                  {f.q}
                  <span className="text-[17px] text-[#7b8977] group-open:hidden">+</span>
                  <span className="hidden text-[17px] text-[#7b8977] group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-[11px] leading-[1.8] text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Thẻ đặt hàng */}
        <aside className="self-start lg:sticky lg:top-5">
          <form onSubmit={submit} className="rounded-[18px] border border-line bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Cài đặt ứng dụng</h2>
              <span className="text-[10px] text-[#89948c]">0{current} / 03</span>
            </div>
            <div className="mb-6 flex items-center gap-1.5">
              {[1, 2, 3].map((n, i) => (
                <div key={n} className="flex flex-1 items-center gap-1.5 last:flex-none">
                  <b
                    className={`grid h-[22px] w-[22px] place-items-center rounded-full text-[10px] ${
                      n === current ? 'bg-ink text-white' : n < current ? 'bg-mint text-[#20321a]' : 'bg-[#edf0eb] text-[#9aab99]'
                    }`}
                  >
                    {n < current ? '✓' : n}
                  </b>
                  {i < 2 && <i className="h-px flex-1 bg-line" />}
                </div>
              ))}
            </div>

            {!loggedIn && (
              <div className="space-y-3">
                <p className="text-xs leading-[1.8] text-muted">Đăng nhập để lưu đơn hàng và tải lại chứng chỉ bất cứ lúc nào.</p>
                <Link href="/login" className="flex w-full items-center justify-center rounded-[10px] bg-mint p-[15px] text-xs font-bold text-[#20321a] hover:bg-mint-dark">
                  Đăng nhập →
                </Link>
                <Link href="/register" className="flex w-full items-center justify-center rounded-[10px] border border-[#d8dfd9] p-3.5 text-xs font-semibold hover:bg-[#edf2e9]">
                  Tạo tài khoản
                </Link>
              </div>
            )}

            {loggedIn && !enroll && (
              <div>
                <div className="mb-1 flex justify-between">
                  <label className="text-[11px] font-semibold">UDID thiết bị</label>
                  <button type="button" onClick={() => setGuide(true)} className="text-[10px] text-[#648d42]">
                    Cách lấy UDID ↗
                  </button>
                </div>
                <p className="mb-3 text-[10px] leading-[1.7] text-muted">
                  Mở trang này bằng <b>Safari trên iPhone</b> rồi bấm nút bên dưới để tải hồ sơ. Hệ thống sẽ tự đọc UDID của thiết bị.
                </p>
                <div className="flex gap-2">
                  <a href="/api/cert-shop/udid/profile" className="flex-1 rounded-lg border border-ink bg-ink p-[9px] text-center text-[10px] text-white">
                    Lấy UDID ↗
                  </a>
                  <button type="button" onClick={() => setGuide(true)} className="flex-1 rounded-lg border border-[#dfe6d7] bg-[#f5f8ef] p-[9px] text-[10px] text-[#5d7e3d]">
                    Hướng dẫn
                  </button>
                </div>
              </div>
            )}

            {loggedIn && enroll && (
              <div>
                <div className="mb-1 flex justify-between">
                  <label className="text-[11px] font-semibold">UDID thiết bị</label>
                  <button type="button" onClick={() => setGuide(true)} className="text-[10px] text-[#648d42]">
                    Cách lấy UDID ↗
                  </button>
                </div>
                <div className="rounded-[9px] border border-[#dfe5de] bg-[#f7f9f5] p-3 font-mono text-[11px] break-all">{enroll.udid}</div>
                <p className="mt-1.5 text-[9px] leading-[1.7] text-muted">
                  {[enroll.product, enroll.version && `iOS ${enroll.version}`].filter(Boolean).join(' · ')}
                  {' · '}Chứng chỉ sẽ được đăng ký cho thiết bị này.
                </p>

                <div className="mt-[19px]">
                  <label className="mb-[9px] block text-[11px] font-semibold">Phương thức thanh toán</label>
                  <select className="w-full rounded-[9px] border border-[#dfe5de] bg-white p-3 text-[11px]" defaultValue="bank">
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="usdt" disabled>
                      USDT (sắp có)
                    </option>
                  </select>
                </div>

                <div className="my-[21px] rounded-xl bg-[#f7f9f5] p-4 text-[11px] text-[#748174]">
                  <Row k="Ứng dụng" v="Metus Browser" />
                  <Row k="Gói chứng chỉ" v={plan ? plan.title.replace(/^Gói\s+/i, '') : 'Chưa chọn'} />
                  <Row k="Bảo hành" v={plan?.warranty || '—'} />
                  <div className="mt-3.5 flex justify-between border-t border-dashed border-[#d8dfd3] pt-3.5 font-bold text-ink">
                    <span>Tổng thanh toán</span>
                    <strong className="text-xl tracking-[-0.7px]">{plan ? vnd(plan.price) : '—'}</strong>
                  </div>
                </div>

                <div role="alert" className="mb-2 min-h-3 text-[10px] text-[#b63838]">{error}</div>
                <button
                  disabled={busy || !plan}
                  className="flex w-full items-center justify-center gap-3 rounded-[10px] bg-mint p-[15px] text-xs font-bold text-[#20321a] transition hover:-translate-y-px hover:bg-mint-dark disabled:opacity-60"
                >
                  {busy ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'} <span>→</span>
                </button>
                <div className="mt-[13px] text-center text-[9px] text-[#8a9587]">♧ &nbsp; Không yêu cầu mật khẩu Apple ID</div>
              </div>
            )}
          </form>
          <p className="mt-4 text-center text-[10px]">
            Cần hỗ trợ cài đặt?{' '}
            <a href="https://t.me/metusvn" target="_blank" rel="noreferrer" className="text-[#648d42]">
              Liên hệ Metus ↗
            </a>
          </p>
        </aside>
      </div>

      {guide && <UdidGuide onClose={() => setGuide(false)} />}
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="mb-3 flex justify-between gap-3">
      <span>{k}</span>
      <strong className="text-right font-medium text-ink">{v}</strong>
    </div>
  );
}
