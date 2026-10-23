'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Plan } from '@/lib/api';
import CheckoutModal, { type Enroll } from './CheckoutModal';
import UdidGuide from './UdidGuide';

const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const DEFAULT_FEATURES = [
  'Phù hợp mọi thiết bị, mọi OS.',
  'Hỗ trợ App group, thông báo đẩy, VPN/network, Siri...',
  'Cài và nhân bản app không giới hạn.',
];

// Dải màu đầu thẻ, lặp lại theo thứ tự gói
const HEADERS = [
  'from-[#5b4de0] via-[#3ab0c8] to-[#2fc79a]',
  'from-[#25285f] via-[#2d87b5] to-[#35a8d0]',
  'from-[#c9894f] via-[#d49a5e] to-[#9a6a4c]',
  'from-[#b94a8e] via-[#d45a74] to-[#ee3b4e]',
];

// Giới thiệu chứng chỉ: ảnh nền ở public/images/cert, `light` = chữ sáng cho nền tối
const APPLE_CARDS = [
  {
    t: 'Tiện lợi hơn',
    d: 'Thuận tiện để cài đặt và thử nghiệm ứng dụng đang phát triển hoặc các ứng dụng nằm ngoài App Store.',
    img: '/images/cert/app.webp',
    light: false,
  },
  {
    t: 'Đơn giản hóa cài đặt',
    d: 'Không cần cắm máy tính hay jailbreak, mọi thao tác cài đặt đều làm ngay trên một thiết bị.',
    img: '/images/cert/install.webp',
    light: false,
  },
  {
    t: 'Đầy đủ tính năng',
    d: 'Hỗ trợ hầu hết các entitlement phổ biến như thông báo đẩy, App Groups và nhiều quyền cần thiết khác của ứng dụng.',
    img: '/images/cert/active.webp',
    light: false,
  },
  {
    t: 'Khác',
    d: 'Nhân bản ứng dụng để chạy nhiều bản cùng lúc. Tiết kiệm và dễ dàng hơn so với tự đăng ký tài khoản nhà phát triển.',
    img: '/images/cert/duplicate.webp',
    light: true,
  },
] as const;

const STEPS = [
  { t: 'Chọn gói & lấy UDID', d: 'Bấm "Mua ngay", đăng nhập và lấy UDID của iPhone.' },
  { t: 'Thanh toán', d: 'Quét mã VietQR, hệ thống tự cấp chứng chỉ sau khi xác nhận.' },
  { t: 'Cài Metus Browser', d: 'Tải chứng chỉ và ứng dụng ngay trên trang đơn hàng.' },
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
    a: 'Hiện hỗ trợ chuyển khoản ngân hàng qua mã VietQR, nội dung chuyển khoản đã điền sẵn. Các phương thức khác sẽ được bổ sung sau.',
  },
];

const KEY = 'metus_plan';
const remember = (id: string) => {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* trình duyệt chặn lưu trữ: bỏ qua */
  }
};
const recall = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export default function Storefront({
  plans,
  loggedIn,
  enroll,
  initialPlan,
}: {
  plans: Plan[];
  loggedIn: boolean;
  enroll: Enroll | null;
  initialPlan: string;
}) {
  const sorted = useMemo(() => [...plans].sort((a, b) => a.price - b.price), [plans]);
  // Gói đề xuất: gói cao thứ hai khi có từ 3 gói trở lên
  const recommended = sorted.length >= 3 ? sorted[sorted.length - 2].id : '';
  const scroller = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState('');
  const [guide, setGuide] = useState(false);

  // Mở lại cửa sổ thanh toán khi: quay về sau cài hồ sơ UDID (?e=), hoặc sau đăng nhập (?plan=)
  useEffect(() => {
    const want = initialPlan || (enroll ? recall() : '');
    if (want && sorted.some((p) => p.id === want)) setSelected(want);
  }, [initialPlan, enroll, sorted]);

  const plan = sorted.find((p) => p.id === selected);

  function buy(id: string) {
    remember(id);
    setSelected(id);
  }

  function scrollBy(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
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
        <div className="self-start rounded-full border border-line bg-white px-3.5 py-[11px] text-[11px] sm:self-auto">◉ &nbsp; Dành cho iPhone</div>
      </div>

      {/* Hero */}
      <div className="relative flex min-h-[250px] items-center overflow-hidden rounded-[22px] bg-[#122b2c] p-6 text-white sm:min-h-[270px] sm:p-8">
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
        <div className="absolute right-[22px] top-[70px] grid h-[90px] w-[90px] -rotate-[9deg] place-items-center rounded-[23px] bg-gradient-to-br from-[#ddff99] to-[#a4d84c] shadow-[0_24px_50px_#0006,inset_0_2px_1px_#ffffffa0] sm:right-[51px] sm:top-[55px] sm:h-32 sm:w-32 sm:rounded-[30px]">
          <Mark className="h-[65px] w-[65px] rotate-[9deg] sm:h-[86px] sm:w-[86px]" stroke="#19382b" />
        </div>
      </div>

      {/* Gói: cùng một hàng trên màn hình rộng, cuộn ngang khi màn hình hẹp */}
      <div id="install" className="mb-5 mt-14 scroll-mt-6">
        <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">
          <span className="bg-gradient-to-r from-[#1d7cf2] to-[#f26b1d] bg-clip-text text-transparent">Chọn gói chứng chỉ</span>
        </h2>
        <p className="mt-1 text-xs text-muted">
          1 thiết bị / gói <span className="lg:hidden">· vuốt ngang để xem thêm</span>
        </p>
      </div>
      <div className="relative">
        <div
          ref={scroller}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-5 pt-3 [scrollbar-width:thin] sm:-mx-9 sm:px-9 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
        >
          {sorted.map((p, i) => {
            const feats = p.features?.length ? p.features : DEFAULT_FEATURES;
            return (
              <article
                key={p.id}
                className="relative flex w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] border border-line bg-white shadow-[0_2px_12px_#1428280a] sm:w-[280px] lg:w-auto"
              >
                <div className={`relative grid h-[140px] place-items-center bg-gradient-to-br ${HEADERS[i % HEADERS.length]}`}>
                  <Mark className="h-[72px] w-[72px] drop-shadow-[0_6px_14px_#0004]" stroke="#ffffff" />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
                  {p.id === recommended && (
                    <span className="absolute right-3 top-3 rounded-md bg-mint px-2 py-1 text-[9px] font-bold text-[#20321a]">GÓI ĐỀ XUẤT</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
                  <div className="text-[26px] font-bold leading-none tracking-tight text-[#f26b1d]">
                    {vnd(p.price)}
                    {/12\s*tháng/i.test(p.validity) && <small className="ml-1 text-[11px] font-normal tracking-normal text-muted">/ năm</small>}
                  </div>
                  <h3 className="mb-3 mt-3 text-sm font-bold">{p.title}</h3>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {p.receiveTime && <Dot c="bg-[#f26b1d]">{p.receiveTime}</Dot>}
                    {p.validity && <Dot c="bg-[#5b86b0]">{p.validity}</Dot>}
                    {p.warranty && <Dot c="bg-[#e8b4a0]">{p.warranty}</Dot>}
                  </ul>
                  <ul className="mt-4 flex-1 space-y-1 text-[11px] leading-[1.6] text-ink">
                    {feats.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => buy(p.id)}
                    className="mt-5 self-start rounded-full bg-mint px-6 py-2.5 text-xs font-bold text-[#20321a] transition hover:-translate-y-px hover:bg-mint-dark"
                  >
                    Mua ngay
                  </button>
                </div>
              </article>
            );
          })}
          {sorted.length === 0 && (
            <p className="w-full rounded-2xl border border-dashed border-[#cfd8cc] bg-white p-8 text-center text-xs text-muted">
              Chưa tải được danh sách gói. Vui lòng thử lại sau.
            </p>
          )}
        </div>
        {sorted.length > 1 && (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Xem các gói tiếp theo"
            className="absolute right-0 top-[45%] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-[#3a3a3acc] text-xl text-white shadow-lg backdrop-blur hover:bg-[#2a2a2a] sm:grid lg:hidden"
          >
            ›
          </button>
        )}
      </div>

      {/* Giới thiệu chứng chỉ Apple: 4 thẻ cùng một hàng trên màn hình rộng, cuộn ngang trên điện thoại */}
      <div className="mb-5 mt-14">
        <h2 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">
          <span className="bg-gradient-to-r from-[#1d7cf2] to-[#f26b1d] bg-clip-text text-transparent">Chứng chỉ Apple</span>
        </h2>
        <a
          href="https://developer.apple.com/support/certificates/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-medium text-[#1d7cf2] hover:underline"
        >
          Tìm hiểu thêm ›
        </a>
      </div>
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:thin] sm:-mx-9 sm:px-9 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {APPLE_CARDS.map((c) => (
          <article
            key={c.t}
            className="relative aspect-[2828/4096] w-[270px] shrink-0 snap-start overflow-hidden rounded-[26px] border border-line bg-white shadow-[0_2px_12px_#1428280a] sm:w-[290px] lg:w-auto"
          >
            {/* Ảnh trang trí nằm dưới chữ, tải lười vì ở dưới màn hình đầu */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className={`relative z-10 p-6 ${c.light ? 'text-white' : 'text-ink'}`}>
              <h3 className="text-[17px] font-bold tracking-tight">{c.t}</h3>
              <p className={`mt-2.5 text-[13px] leading-[1.6] ${c.light ? 'text-[#e3eee9]' : 'text-ink'}`}>{c.d}</p>
            </div>
          </article>
        ))}
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
      <div id="faq" className="mb-[17px] mt-8 flex scroll-mt-6 items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Bạn cần biết thêm?</h2>
        <span className="text-[11px] text-muted">Giải đáp trước khi cài đặt</span>
      </div>
      <div className="max-w-3xl">
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
      <p className="mt-6 text-[11px]">
        Cần hỗ trợ cài đặt?{' '}
        <a href="https://t.me/metusvn" target="_blank" rel="noreferrer" className="text-[#648d42]">
          Liên hệ Metus ↗
        </a>
      </p>

      {plan && (
        <CheckoutModal plan={plan} loggedIn={loggedIn} enroll={enroll} onGuide={() => setGuide(true)} onClose={() => setSelected('')} />
      )}
      {guide && <UdidGuide onClose={() => setGuide(false)} />}
    </>
  );
}

function Dot({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c}`} />
      {children}
    </li>
  );
}

/** Biểu tượng Metus (quả cầu và chữ M) dùng cho thẻ gói và hero. */
function Mark({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="33" stroke={stroke} strokeWidth="3" />
      <ellipse cx="50" cy="50" rx="17" ry="33" stroke={stroke} strokeWidth="2" />
      <path d="M18 40h64M18 60h64" stroke={stroke} strokeWidth="2" />
      <path d="M28 65V39l11 13 11-13 11 13 11-13v26" stroke={stroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
