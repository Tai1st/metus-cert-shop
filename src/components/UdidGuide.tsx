'use client';

import { useEffect, useState, type ReactNode } from 'react';

/* ---------- Hình minh họa các bước (vẽ bằng HTML, đúng tên miền và hồ sơ của shop) ---------- */

const ring = 'ring-2 ring-red-500 ring-offset-1';

function Panel({ dim, wide, children }: { dim?: boolean; wide?: boolean; children: ReactNode }) {
  return (
    <div
      className={`relative min-h-[170px] shrink-0 overflow-hidden rounded-xl border border-line bg-white p-2.5 text-[9px] leading-tight sm:w-auto sm:flex-1 ${wide ? 'w-full sm:shrink' : 'w-[160px]'}`}
    >
      {children}
      {dim && <div className="absolute inset-0 bg-black/45" />}
    </div>
  );
}

/** Hộp thoại kiểu iOS, đặt đè lên lớp tối của Panel */
function IosDialog({ title, body, actions }: { title?: string; body: string; actions: { label: string; hit?: boolean }[] }) {
  return (
    <div className="absolute inset-x-2 top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-xl bg-[#2c2c2e] text-center text-white">
      <div className="p-2.5">
        {title && <div className="mb-1 text-[10px] font-semibold">{title}</div>}
        <div className="text-[9px] leading-snug text-[#e5e5ea]">{body}</div>
      </div>
      <div className="flex border-t border-[#48484a]">
        {actions.map((a) => (
          <div key={a.label} className={`flex-1 overflow-hidden py-1.5 text-[9px] text-[#4a9bff] ${a.hit ? 'font-semibold' : ''}`}>
            <span className={`whitespace-nowrap rounded px-0.5 ${a.hit ? ring : ''}`}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FakeOrderCard() {
  return (
    <>
      <div className="mb-1 font-semibold">UDID thiết bị</div>
      <div className="mb-2 rounded-md border border-[#dfe5de] p-1.5 text-muted">Nhập UDID của iPhone / iPad</div>
      <div className="flex gap-1.5">
        <div className={`flex-1 rounded-md bg-ink p-1.5 text-center text-white ${ring}`}>Lấy UDID ↗</div>
        <div className="flex-1 rounded-md border border-[#dfe6d7] bg-[#f5f8ef] p-1.5 text-center text-[#5d7e3d]">Hướng dẫn</div>
      </div>
      <div className="mt-3 mb-1 font-semibold">Phương thức thanh toán</div>
      <div className="rounded-md border border-[#dfe5de] p-1.5 text-muted">Chuyển khoản ngân hàng</div>
    </>
  );
}

function FigureDownload() {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      <Panel>
        <FakeOrderCard />
      </Panel>
      <Panel dim>
        <FakeOrderCard />
        <IosDialog
          body="“appstore.metus.vn” đang cố gắng tải về một hồ sơ cấu hình. Bạn có muốn cho phép việc này không?"
          actions={[{ label: 'Bỏ qua' }, { label: 'Cho phép', hit: true }]}
        />
      </Panel>
      <Panel dim>
        <FakeOrderCard />
        <IosDialog
          title="Đã tải về hồ sơ"
          body="Xem lại hồ sơ trong ứng dụng Cài đặt nếu bạn muốn cài đặt hồ sơ."
          actions={[{ label: 'Đóng', hit: true }]}
        />
      </Panel>
    </div>
  );
}

function FigureInstall() {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      <Panel>
        <div className="mb-2 text-sm font-bold">Cài đặt</div>
        <div className="space-y-1.5">
          <div className="rounded-lg bg-[#f2f2f7] p-2 text-muted">Tìm kiếm</div>
          <div className={`flex items-center justify-between rounded-lg bg-[#f2f2f7] p-2 ${ring}`}>
            <span className="font-semibold text-ink">Đã tải về hồ sơ</span>
            <span className="text-muted">›</span>
          </div>
          <div className="rounded-lg bg-[#f2f2f7] p-2">Chung</div>
          <div className="rounded-lg bg-[#f2f2f7] p-2">Màn hình &amp; Độ sáng</div>
        </div>
      </Panel>
      <Panel>
        <div className="mb-2 flex items-center justify-between text-[10px] text-[#007aff]">
          <span>Hủy</span>
          <span className={`rounded px-1 font-semibold ${ring}`}>Cài đặt</span>
        </div>
        <div className="mb-1.5 text-center">
          <div className="text-[11px] font-bold">Lấy UDID thiết bị</div>
          <div className="text-muted">Metus</div>
        </div>
        <div className="space-y-1 rounded-lg bg-[#f2f2f7] p-2">
          <div className="flex justify-between"><span className="text-muted">Đã ký bởi</span><span className="text-red-600">Chưa được ký</span></div>
          <div className="flex justify-between"><span className="text-muted">Mô tả</span><span className="max-w-[60%] text-right">Xác định UDID thiết bị</span></div>
          <div className="flex justify-between"><span className="text-muted">Chứa</span><span>Dịch vụ hồ sơ</span></div>
        </div>
      </Panel>
    </div>
  );
}

function FigureBack() {
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <Panel wide>
        <div className="mb-2 rounded-full bg-[#f2f2f7] px-2 py-1 text-center text-[#3c3c43]">🔒 appstore.metus.vn</div>
        <div className="mb-1 font-semibold">UDID thiết bị</div>
        <div className="mb-1 break-all rounded-md border border-[#dfe5de] bg-[#f7f9f5] p-1.5 font-mono">00008120-000A11223344401E</div>
        <div className="mb-2 text-muted">iPhone15,3 · iOS 22A100</div>
        <div className="rounded-md bg-mint p-2 text-center font-bold text-[#20321a]">Tiếp tục thanh toán →</div>
      </Panel>
      <div className="flex flex-1 items-center rounded-xl border border-dashed border-[#cfd8cc] bg-[#f7f9f5] p-3 text-[10px] leading-[1.7] text-muted">
        UDID được điền sẵn. Bạn chỉ cần chọn gói và thanh toán, không phải sao chép thủ công.
      </div>
    </div>
  );
}


type Step = { t: string; d: ReactNode; fig?: ReactNode };

const IPHONE: Step[] = [
  {
    t: 'Tải về hồ sơ',
    d: (
      <>
        Mở trang bằng <b>Safari trên chính iPhone/iPad</b> cần cài app, bấm <b>Lấy UDID</b> rồi chọn <b>Cho phép</b> khi
        được hỏi tải hồ sơ cấu hình.
      </>
    ),
    fig: <FigureDownload />,
  },
  {
    t: 'Cài đặt hồ sơ',
    d: (
      <>
        Vào <b>Cài đặt</b>, chọn <b>Hồ sơ đã tải về</b> rồi bấm <b>Cài đặt</b>. Nếu không thấy mục này, vào theo đường
        dẫn:
        <span className="mt-3 block rounded-[10px] border border-[#e1e8d8] bg-[#f4f7f0] p-3 text-[11px] leading-relaxed text-[#556649]">
          Cài đặt chung → Quản lý VPN &amp; thiết bị → Lấy UDID thiết bị
        </span>
      </>
    ),
    fig: <FigureInstall />,
  },
  {
    t: 'Quay lại trang mua hàng',
    d: (
      <>
        Sau khi cài xong, Safari tự mở lại trang này và <b>UDID được điền sẵn</b>, không cần sao chép thủ công. Bạn chỉ
        cần chọn gói và thanh toán.
      </>
    ),
    fig: <FigureBack />,
  },
];

const THREEU: Step[] = [
  {
    t: 'Kết nối iPhone với 3uTools',
    d: (
      <>
        Cài 3uTools trên máy tính, cắm iPhone bằng cáp USB, mở khóa và chọn <b>Tin cậy máy tính này</b> nếu được hỏi.
      </>
    ),
  },
  {
    t: 'Cập nhật thông tin thiết bị',
    d: (
      <>
        Nhấn <b>Refresh iDevice Info</b>, rồi <b>View iDevice Details</b> nếu cần xem thêm.
      </>
    ),
  },
  {
    t: 'Sao chép toàn bộ UDID',
    d: (
      <>
        Sao chép giá trị <b>UDID</b>, tránh nhầm với số sê-ri, IMEI hay ECID. Lưu ý cách này cần nhập UDID thủ công,
        nên dùng cách lấy bằng hồ sơ trên iPhone nếu có thể.
      </>
    ),
  },
];

export default function UdidGuide({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'iphone' | '3u'>('iphone');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const steps = tab === 'iphone' ? IPHONE : THREEU;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c202675] p-5 backdrop-blur-[6px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="udid-guide-title"
        className="relative max-h-[90vh] w-[660px] max-w-full overflow-y-auto rounded-[22px] bg-white p-7 shadow-[0_30px_90px_#0003]"
      >
        <button
          onClick={onClose}
          aria-label="Đóng hướng dẫn"
          className="absolute right-[18px] top-[15px] h-7 w-7 rounded-full bg-[#f2f5ef] text-[#64715e]"
        >
          ×
        </button>
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[2px]">
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#87b844]" /> HƯỚNG DẪN THIẾT BỊ
        </div>
        <h2 id="udid-guide-title" className="mb-2 mt-2 text-lg font-bold tracking-tight">
          Lấy UDID của bạn
        </h2>
        <p className="text-xs leading-relaxed text-muted">Chọn cách phù hợp để lấy mã thiết bị và quay lại hoàn tất đơn hàng.</p>

        <div className="my-5 flex rounded-[10px] bg-[#f0f4ec] p-1" role="tablist" aria-label="Cách lấy UDID">
          {(
            [
              ['iphone', 'Trên iPhone'],
              ['3u', 'Bằng 3uTools'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-[7px] p-2.5 text-xs ${
                tab === k ? 'bg-white font-bold text-ink shadow-[0_2px_7px_#21310f0c]' : 'text-[#7b8874]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {steps.map((s, i) => (
            <div key={s.t} className="border-b border-line py-5 last:border-0 last:pb-0">
              <h3 className="flex items-center gap-2.5 text-sm font-bold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#edf4e4] text-xs text-[#5d7d3b]">
                  {i + 1}
                </span>
                {s.t}
              </h3>
              <p className="mt-2 text-xs leading-[1.9] text-muted">{s.d}</p>
              {s.fig}
            </div>
          ))}
        </div>

        <div className="sticky -bottom-7 mt-3 border-t border-line bg-white pt-4">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-3 rounded-[10px] bg-mint p-[15px] text-xs font-bold text-[#20321a] transition hover:bg-mint-dark"
          >
            Đã hiểu <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
