'use client';

import { useRef, useState } from 'react';
import { post, put, uploadRaw } from '@/lib/client';
import { fmtSize } from '@/lib/format';
import { Use } from './IconSprite';
import { Badge, Card, InfoRow, PageHead, ResultEmpty } from './ui';

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
  'min-h-[43px] w-full rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-[10px] outline-none focus:border-[#9cba72] focus:shadow-[0_0_0_3px_#d0e5ad30]';
const label = 'mb-[9px] block text-[10px] font-medium';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Ảnh cho app ký nhanh đã biết trước; slug khác (admin thêm sau) dùng chữ cái đầu làm biểu tượng.
const QUICK_APP_ICONS: Record<string, string> = {
  metus: '/images/apps/metus.webp',
  esign: '/images/apps/esign.webp',
};

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
      const picked = await put(`/sign/jobs/${id}/quick-app/${quick}`);
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

  if (!status.signerReady) {
    return (
      <div>
        <PageHead title="Ký ứng dụng IPA" sub="Một nơi để chuẩn bị ứng dụng, chứng chỉ và tùy chọn cài đặt." />
        <Card>
          <p className="text-xs leading-[1.8] text-muted">Công cụ ký đang được chuẩn bị, vui lòng quay lại sau.</p>
        </Card>
      </div>
    );
  }

  const picked = quickApps.find((a) => a.slug === source);

  return (
    <div>
      <PageHead
        title="Ký ứng dụng IPA"
        sub="Một nơi để chuẩn bị ứng dụng, chứng chỉ và tùy chọn cài đặt."
        action={left !== null && <Badge status={left === 0 ? 'failed' : 'completed'} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-[23px] shadow-[0_5px_24px_#21361703]">
          <div className="mb-[22px] flex items-center gap-2.5 text-xs font-semibold">
            <b className="grid h-[25px] w-[25px] place-items-center rounded-lg bg-[#edf4e0] text-[9px] text-[#809a5b]">01</b>
            Chọn ứng dụng
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
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
                className={`flex min-h-[90px] flex-col items-center justify-center gap-2 rounded-[13px] bg-white p-2.5 text-[9px] text-[#80956c] shadow-[0_4px_12px_#25351b03] disabled:opacity-60 ${
                  source === a.slug ? 'bg-[#f2f8e9] shadow-[0_0_0_2px_#dcebc729]' : ''
                }`}
              >
                {QUICK_APP_ICONS[a.slug] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={QUICK_APP_ICONS[a.slug]} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-xs font-extrabold text-white">
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
              className={`flex min-h-[90px] flex-col items-center justify-center gap-2 rounded-[13px] bg-white p-2.5 text-[9px] text-[#80956c] shadow-[0_4px_12px_#25351b03] disabled:opacity-60 ${
                source === '' ? 'bg-[#f2f8e9] shadow-[0_0_0_2px_#dcebc729]' : ''
              }`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f3ed] text-xl text-[#8a9e79]">⇪</span>
              IPA của bạn
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
          <div className="mb-[12px] rounded-[10px] bg-[#f2f7eb] p-3.5 text-[10px] leading-[1.9] text-[#8b9d75]">
            {picked
              ? `Đã chọn ${picked.name}${picked.version ? ` v${picked.version}` : ''} có sẵn trên server, không cần tải lên.`
              : ipaName
                ? `Đã chọn: ${ipaName}`
                : `Bấm vào một ứng dụng để ký ngay, hoặc "IPA của bạn" để tải file riêng (tối đa ${status.maxMb} MB).`}
          </div>

          <hr className="my-6 border-line" />

          <div className="mb-[22px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <b className="grid h-[25px] w-[25px] place-items-center rounded-lg bg-[#edf4e0] text-[9px] text-[#809a5b]">02</b>
              Chọn chứng chỉ
            </div>
            <div className="flex gap-[3px] rounded-lg bg-[#f3f6ed] p-1">
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
                  className={`rounded-md px-3 py-2 text-[9px] ${mode === k ? 'bg-white font-semibold text-ink shadow-sm' : 'text-[#929f84]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {mode === 'zip' ? (
            <>
              <FilePick icon="▤" name={zipName} placeholder="Chọn file chứng chỉ .zip" disabled={busy} onClick={() => zipRef.current?.click()} />
              <p className="mt-2 text-[9px] leading-[1.8] text-[#9aa88a]">Gói .zip tải ở trang đơn hàng, hoặc gói của bạn, bên trong có file .p12 và .mobileprovision.</p>
            </>
          ) : (
            <div className="space-y-2.5">
              <FilePick icon="🔑" name={p12Name} placeholder="Chọn file chứng chỉ .p12" disabled={busy} onClick={() => p12Ref.current?.click()} />
              <FilePick icon="▤" name={profName} placeholder="Chọn file .mobileprovision" disabled={busy} onClick={() => profRef.current?.click()} />
              <p className="text-[9px] leading-[1.8] text-[#9aa88a]">Dùng khi bạn có sẵn chứng chỉ riêng, không cần mua ở shop.</p>
            </div>
          )}
          <input ref={zipRef} type="file" accept=".zip" hidden onChange={(e) => setZipName(e.target.files?.[0]?.name ?? '')} />
          <input ref={p12Ref} type="file" accept=".p12" hidden onChange={(e) => setP12Name(e.target.files?.[0]?.name ?? '')} />
          <input ref={profRef} type="file" accept=".mobileprovision" hidden onChange={(e) => setProfName(e.target.files?.[0]?.name ?? '')} />

          <div className="mt-[20px]">
            <label className={label} htmlFor="pw">
              Mật khẩu chứng chỉ
            </label>
            <input id="pw" name="password" type="password" autoComplete="off" placeholder="Nhập mật khẩu nếu có" disabled={busy} className={field} />
          </div>

          <hr className="my-6 border-line" />

          <div className="mb-[22px] flex items-center gap-2.5 text-xs font-semibold">
            <b className="grid h-[25px] w-[25px] place-items-center rounded-lg bg-[#edf4e0] text-[9px] text-[#809a5b]">03</b>
            Tùy chọn ứng dụng
          </div>
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <div className="flex-1">
              <label className={label} htmlFor="bid">
                Bundle ID <span className="text-muted">(tùy chọn)</span>
              </label>
              <input id="bid" name="bundleId" placeholder="com.example.app" disabled={busy} className={field} />
            </div>
            <div className="flex-1">
              <label className={label} htmlFor="nm">
                Tên ứng dụng <span className="text-muted">(tùy chọn)</span>
              </label>
              <input id="nm" name="name" maxLength={60} placeholder="Tên hiển thị" disabled={busy} className={field} />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-[10px] leading-[1.8] text-[#b45b45]">
              {error}
            </p>
          )}
          <button
            disabled={busy || left === 0}
            className="mt-5 w-full rounded-[9px] bg-lime py-3.5 text-xs font-semibold text-[#2b461a] hover:bg-lime-dark disabled:opacity-60"
          >
            {busy ? 'Đang xử lý…' : left === 0 ? 'Đã hết lượt ký hôm nay' : 'Ký ứng dụng'} {!busy && <Use id="i-arrow" className="icon ml-1 inline h-3.5 w-3.5" />}
          </button>
        </form>

        <div className="space-y-5">
          <Card>
            <div className="mb-[22px] flex items-center justify-between">
              <h2 className="text-[15px] tracking-[-0.4px]">Tiến trình ký</h2>
              <span className="rounded-full bg-[#eaf3f6] px-2.5 py-1.5 text-[8px] text-[#598496]">
                {result ? 'Hoàn tất' : busy ? step : 'Chưa bắt đầu'}
              </span>
            </div>
            {result?.signed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Use id="i-check" className="icon h-4 w-4 text-[#7d9a51]" /> Đã ký xong
                </div>
                <p className="text-[10px] leading-[1.8] text-muted">
                  {result.signed.name || result.signed.bundleId} · v{result.signed.version} · {fmtSize(result.signed.size)}
                  <br />
                  <span className="font-mono">{result.signed.bundleId}</span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <a href={result.installUrl} className="rounded-[9px] bg-lime py-2.5 text-center text-[10px] font-semibold text-[#2b461a] hover:bg-lime-dark">
                    Cài đặt ngay
                  </a>
                  <a href={result.downloadUrl} className="rounded-[9px] border border-line bg-white py-2.5 text-center text-[10px] font-semibold hover:bg-[#f3f6ed]">
                    Tải IPA đã ký
                  </a>
                </div>
              </div>
            ) : busy ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span>{step}…</span>
                  {percent !== null && <b>{percent}%</b>}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e8eddf]">
                  <div
                    className={`h-full bg-[#adc981] transition-all ${percent === null ? 'w-1/3 animate-pulse' : ''}`}
                    style={percent === null ? undefined : { width: `${percent}%` }}
                  />
                </div>
              </div>
            ) : (
              <ResultEmpty icon={<Use id="i-sign" className="icon h-8 w-8" />} title="Ứng dụng đang chờ bạn">
                Chọn ứng dụng và chứng chỉ, rồi bắt đầu ký.
              </ResultEmpty>
            )}
          </Card>

          <Card>
            <h2 className="mb-[18px] text-[15px] tracking-[-0.4px]">Trước khi bắt đầu</h2>
            <InfoRow k="Ứng dụng" v="Định dạng .ipa" />
            <InfoRow k="Chứng chỉ" v=".zip hoặc .p12 + hồ sơ" />
            <InfoRow k="Thiết bị" v="Khớp UDID trong hồ sơ" />
            <p className="mt-3 text-[9px] leading-[1.8] text-[#9aa88a]">
              Chứng chỉ và mật khẩu không được lưu. File được xóa sau 1 giờ.
              {left !== null && ` Còn ${left} lượt ký trong 24 giờ.`}
            </p>
          </Card>
        </div>
      </div>
    </div>
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
