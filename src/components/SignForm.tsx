'use client';

import { useRef, useState } from 'react';
import { post, uploadRaw } from '@/lib/client';
import { fmtSize } from '@/lib/format';

export interface QuickApp {
  slug: string;
  name: string;
  version?: string;
  bundleId?: string;
  minOs?: string;
  size?: number;
}

interface Status {
  signerReady: boolean;
  maxMb: number;
  /** Số lượt ký còn lại trong 24 giờ; null = không giới hạn. */
  quotaLeft: number | null;
}

interface JobView {
  state: 'created' | 'waiting' | 'running' | 'done' | 'failed';
  error: string;
  signed?: { bundleId: string; name: string; version: string; size: number };
  downloadUrl?: string;
  installUrl?: string;
  expiresAt: number;
}

const field =
  'w-full rounded-[14px] border border-[#e1e7e0] bg-[#f6f8f4] px-4 py-3 text-xs outline-none focus:border-[#6c9b44] focus:shadow-[0_0_0_3px_#c7f36b35]';
const label = 'mb-2 block text-[11px] font-semibold';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Ảnh cho app ký nhanh đã biết trước; slug khác (admin thêm sau) dùng chữ cái đầu làm biểu tượng.
const QUICK_APP_ICONS: Record<string, string> = { esign: '/images/apps/esign.webp' };

export default function SignForm({ status, quickApps }: { status: Status; quickApps: QuickApp[] }) {
  const ipaRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const p12Ref = useRef<HTMLInputElement>(null);
  const profRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'zip' | 'manual'>('zip');
  // null = chưa chọn; '' = tự tải file lên; slug = dùng app có sẵn trên server
  const [source, setSource] = useState<string | null>(null);
  const [ipaName, setIpaName] = useState('');
  const [zipName, setZipName] = useState('');
  const [p12Name, setP12Name] = useState('');
  const [profName, setProfName] = useState('');
  const [step, setStep] = useState('');
  const [percent, setPercent] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<JobView | null>(null);
  const [left, setLeft] = useState(status.quotaLeft);
  const busy = Boolean(step) && !result && !error;

  function pickOwnFile() {
    setSource('');
    ipaRef.current?.click();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ipa = ipaRef.current?.files?.[0];
    const zip = zipRef.current?.files?.[0];
    const p12 = p12Ref.current?.files?.[0];
    const prof = profRef.current?.files?.[0];
    setError('');
    setResult(null);
    const quick = source || null;
    if (!quick) {
      if (!ipa || !/\.ipa$/i.test(ipa.name)) return setError('Chọn file ứng dụng .ipa');
      if (ipa.size > status.maxMb * 1048576) return setError(`File IPA lớn hơn ${status.maxMb} MB, vượt giới hạn`);
    }
    if (mode === 'zip') {
      if (!zip || !/\.zip$/i.test(zip.name)) return setError('Chọn gói chứng chỉ .zip (chứa .p12 và .mobileprovision)');
    } else {
      if (!p12 || !/\.p12$/i.test(p12.name)) return setError('Chọn file chứng chỉ .p12');
      if (!prof || !/\.mobileprovision$/i.test(prof.name)) return setError('Chọn file .mobileprovision');
    }

    const fail = (m: string) => {
      setError(m);
      setStep('');
      setPercent(null);
    };

    setStep('Khởi tạo lượt ký');
    const job = await post<{ id: string }>('/sign/jobs');
    if (!job.ok) return fail(job.error);
    const id = job.data.id;

    if (quick) {
      setStep('Chọn ứng dụng');
      const picked = await post(`/sign/jobs/${id}/quick-app/${quick}`);
      if (!picked.ok) return fail(picked.error);
    } else {
      setStep('Tải ứng dụng lên');
      setPercent(0);
      const up1 = await uploadRaw(`/sign/jobs/${id}/ipa`, ipa!, setPercent);
      if (!up1.ok) return fail(up1.error);
    }

    setStep('Gửi chứng chỉ');
    setPercent(null);
    const parts =
      mode === 'zip'
        ? [uploadRaw(`/sign/jobs/${id}/cert`, zip!)]
        : [uploadRaw(`/sign/jobs/${id}/p12`, p12!), uploadRaw(`/sign/jobs/${id}/profile`, prof!)];
    for (const r of await Promise.all(parts)) if (!r.ok) return fail(r.error);

    setStep('Đang ký ứng dụng');
    const body: Record<string, string> = { password: String(f.get('password') ?? '') };
    const bundleId = String(f.get('bundleId') ?? '').trim();
    const name = String(f.get('name') ?? '').trim();
    if (bundleId) body.bundleId = bundleId;
    if (name) body.name = name;
    const start = await post(`/sign/jobs/${id}/start`, body);
    if (!start.ok) return fail(start.error);
    setLeft((l) => (l === null ? l : Math.max(0, l - 1)));

    // Hỏi trạng thái cho tới khi ký xong (tối đa khoảng 4 phút)
    for (let i = 0; i < 160; i++) {
      await wait(1500);
      const r = await fetch(`/api/cert-shop/sign/jobs/${id}`);
      if (!r.ok) return fail('Không đọc được trạng thái, vui lòng thử lại');
      const v = (await r.json()) as JobView;
      if (v.state === 'done') {
        setStep('');
        return setResult(v);
      }
      if (v.state === 'failed') return fail(v.error || 'Ký thất bại');
    }
    fail('Ký quá lâu, vui lòng thử lại');
  }

  const head = (
    <div className="mb-6 text-center">
      <h1 className="text-[34px] font-extrabold tracking-tight">
        <span className="text-[#1d7cf2]">Ký </span>
        <span className="text-[#f26b1d]">iPA online</span>
      </h1>
      <p className="mt-1 text-sm text-muted">Ký và cài đặt ứng dụng của bạn</p>
    </div>
  );

  if (!status.signerReady) {
    return (
      <>
        {head}
        <Box>
          <p className="text-xs leading-[1.8] text-muted">Công cụ ký đang được chuẩn bị, vui lòng quay lại sau.</p>
        </Box>
      </>
    );
  }

  const picked = quickApps.find((a) => a.slug === source);

  return (
    <>
      {head}
      <Box>
        <form onSubmit={submit}>
          <div className="mb-5">
            <label className={label}>File ứng dụng</label>
            <div className="grid grid-cols-5 gap-2">
              {quickApps.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  disabled={busy}
                  aria-pressed={source === a.slug}
                  onClick={() => {
                    setSource(a.slug);
                    setIpaName('');
                    if (ipaRef.current) ipaRef.current.value = '';
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border bg-white py-3 text-[10px] font-semibold disabled:opacity-60 ${
                    source === a.slug ? 'border-[1.5px] border-accent bg-tint' : 'border-line hover:border-accent'
                  }`}
                >
                  {QUICK_APP_ICONS[a.slug] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={QUICK_APP_ICONS[a.slug]} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-sm font-extrabold text-white">
                      {a.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  {a.name}
                </button>
              ))}
              <button
                type="button"
                disabled={busy}
                aria-pressed={source === ''}
                onClick={pickOwnFile}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border bg-white py-3 text-[10px] font-semibold disabled:opacity-60 ${
                  source === '' ? 'border-[1.5px] border-accent bg-tint' : 'border-line hover:border-accent'
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f3f5f7] text-2xl text-[#1d7cf2]">⇪</span>
                Chọn tệp
              </button>
            </div>
            <input
              ref={ipaRef}
              type="file"
              accept=".ipa"
              hidden
              onChange={(e) => {
                setIpaName(e.target.files?.[0]?.name ?? '');
                setSource('');
              }}
            />
            <p className="mt-2 truncate text-[10px] text-muted">
              {picked
                ? `Dùng ${picked.name}${picked.version ? ` v${picked.version}` : ''} có sẵn trên server, không cần tải lên.`
                : ipaName
                  ? `Đã chọn: ${ipaName}`
                  : `Bấm vào một ứng dụng để ký ngay, hoặc "Chọn tệp" để tải IPA của riêng bạn (tối đa ${status.maxMb} MB).`}
            </p>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-semibold">Nhập file chứng chỉ</label>
              <div className="flex rounded-full bg-[#eef1ec] p-0.5 text-[10px] font-semibold">
                {(
                  [
                    ['zip', 'Gói .zip'],
                    ['manual', 'Nhập thủ công'],
                  ] as const
                ).map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    disabled={busy}
                    onClick={() => setMode(k)}
                    className={`rounded-full px-3 py-1 ${mode === k ? 'bg-white text-ink shadow-sm' : 'text-[#7b8874]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'zip' ? (
              <>
                <FilePick icon="▤" name={zipName} placeholder="Chọn file chứng chỉ .zip" disabled={busy} onClick={() => zipRef.current?.click()} />
                <p className="mt-1.5 text-[10px] text-muted">Gói .zip tải ở trang đơn hàng, hoặc gói của bạn, bên trong có file .p12 và .mobileprovision.</p>
              </>
            ) : (
              <div className="space-y-2">
                <FilePick icon="🔑" name={p12Name} placeholder="Chọn file chứng chỉ .p12" disabled={busy} onClick={() => p12Ref.current?.click()} />
                <FilePick icon="▤" name={profName} placeholder="Chọn file .mobileprovision" disabled={busy} onClick={() => profRef.current?.click()} />
                <p className="text-[10px] text-muted">Dùng khi bạn có sẵn chứng chỉ riêng, không cần mua ở shop.</p>
              </div>
            )}
            <input ref={zipRef} type="file" accept=".zip" hidden onChange={(e) => setZipName(e.target.files?.[0]?.name ?? '')} />
            <input ref={p12Ref} type="file" accept=".p12" hidden onChange={(e) => setP12Name(e.target.files?.[0]?.name ?? '')} />
            <input ref={profRef} type="file" accept=".mobileprovision" hidden onChange={(e) => setProfName(e.target.files?.[0]?.name ?? '')} />
          </div>

          <div className="mb-5">
            <label className={label} htmlFor="pw">Mật khẩu chứng chỉ</label>
            <input id="pw" name="password" type="password" autoComplete="off" placeholder="Nhập mật khẩu nếu có" disabled={busy} className={field} />
          </div>

          <div className="mb-5 grid gap-4 border-t border-line pt-5">
            <div>
              <label className={label} htmlFor="bid">Bundle ID (tùy chọn)</label>
              <input id="bid" name="bundleId" placeholder="Không bắt buộc" disabled={busy} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="nm">Tên ứng dụng (tùy chọn)</label>
              <input id="nm" name="name" maxLength={60} placeholder="Không bắt buộc" disabled={busy} className={field} />
            </div>
          </div>

          {(step || error) && (
            <div className="mb-4 rounded-xl bg-[#f7f9f5] p-3 text-xs">
              {step && (
                <>
                  <div className="flex items-center justify-between">
                    <span>{step}…</span>
                    {percent !== null && <b>{percent}%</b>}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6ebe4]">
                    <div
                      className={`h-full bg-mint transition-all ${percent === null ? 'w-1/3 animate-pulse' : ''}`}
                      style={percent === null ? undefined : { width: `${percent}%` }}
                    />
                  </div>
                </>
              )}
              {error && <p role="alert" className="text-[#b63838]">{error}</p>}
            </div>
          )}

          <button
            disabled={busy || left === 0}
            className="w-full rounded-full bg-[#2a86ff] p-4 text-sm font-bold text-white transition hover:bg-[#1f78ee] disabled:opacity-60"
          >
            {busy ? 'Đang xử lý…' : left === 0 ? 'Đã hết lượt ký hôm nay' : 'Ký iPA'}
          </button>
          <p className="mt-3 text-center text-[9px] leading-[1.7] text-[#8a9587]">
            Chứng chỉ và mật khẩu không được lưu. File được xóa sau 1 giờ.
            {left !== null && ` Còn ${left} lượt ký trong 24 giờ.`}
          </p>
        </form>

        {result?.signed && (
          <div className="mt-6 space-y-3 rounded-2xl border border-[#cfe0bd] bg-tint p-4 text-xs">
            <div className="font-bold">✓ Đã ký xong</div>
            <div className="text-muted">
              {result.signed.name || result.signed.bundleId} · v{result.signed.version} · {fmtSize(result.signed.size)}
              <br />
              <span className="font-mono text-[10px]">{result.signed.bundleId}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <a href={result.installUrl} className="rounded-[12px] bg-mint p-3 text-center text-[11px] font-bold text-[#20321a] hover:bg-mint-dark">
                Cài đặt ngay
              </a>
              <a href={result.downloadUrl} className="rounded-[12px] border border-[#d8dfd9] bg-white p-3 text-center text-[11px] font-bold hover:bg-[#edf2e9]">
                Tải IPA đã ký
              </a>
            </div>
            <p className="text-[10px] leading-[1.7] text-muted">
              Nút &quot;Cài đặt ngay&quot; chỉ hoạt động khi mở trang bằng Safari trên iPhone, và chứng chỉ phải gồm UDID của thiết bị đó. Liên kết hết hạn sau 1 giờ.
            </p>
          </div>
        )}
      </Box>
    </>
  );
}

function FilePick({ icon, name, placeholder, disabled, onClick }: { icon: string; name: string; placeholder: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${field} flex items-center gap-2 text-left ${name ? 'text-ink' : 'text-[#9aa89a]'}`}>
      <span aria-hidden>{icon}</span>
      <span className="truncate">{name || placeholder}</span>
    </button>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[520px] rounded-[26px] border border-line bg-white p-6 shadow-[0_2px_18px_#1428280a] sm:p-7">{children}</div>;
}
