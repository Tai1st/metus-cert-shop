'use client';

import { useRef, useState } from 'react';
import { post } from '@/lib/client';

interface Cert {
  commonName: string;
  organization: string;
  teamId: string;
  type: string;
  notBefore: string;
  notAfter: string;
  expired: boolean;
  notYetValid: boolean;
  daysLeft: number;
}
interface Profile {
  name?: string;
  teamName?: string;
  appId?: string;
  expires?: string;
  expired?: boolean;
  daysLeft?: number | null;
  allDevices?: boolean;
  devices?: number;
  matchesCert?: boolean;
  error?: string;
}
interface Result {
  certificate: Cert;
  profile: Profile | null;
}

const field =
  'w-full rounded-[14px] border border-[#e1e7e0] bg-[#f6f8f4] px-4 py-3 text-xs outline-none focus:border-[#6c9b44] focus:shadow-[0_0_0_3px_#c7f36b35]';
const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(new Error('Không đọc được file'));
    r.readAsDataURL(file);
  });

export default function CheckForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    setError('');
    setResult(null);
    if (!file || !/\.zip$/i.test(file.name)) return setError('Chọn gói chứng chỉ .zip (chứa .p12 và .mobileprovision)');
    if (file.size > 1024 * 1024) return setError('Gói chứng chỉ lớn hơn 1MB, vui lòng kiểm tra lại file');
    setBusy(true);
    try {
      const r = await post<Result>('/check', { zip: await toBase64(file), password });
      if (!r.ok) setError(r.error);
      else setResult(r.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto grid max-w-[900px] gap-8 lg:grid-cols-[400px_1fr]">
      <div className="rounded-[26px] border border-line bg-white p-6 shadow-[0_2px_18px_#1428280a] sm:p-7">
        <h1 className="mb-6 text-center text-[30px] font-extrabold tracking-tight">
          <span className="text-[#1d7cf2]">Kiểm tra </span>
          <span className="text-[#f26b1d]">chứng chỉ</span>
        </h1>
        <form onSubmit={submit}>
          <label className="mb-2 block text-[11px] font-semibold">Nhập file chứng chỉ</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={`${field} mb-5 flex items-center gap-2 text-left ${name ? 'text-ink' : 'text-[#9aa89a]'}`}
          >
            <span aria-hidden>▤</span>
            <span className="truncate">{name || 'Chọn file chứng chỉ .zip'}</span>
          </button>
          <input ref={fileRef} type="file" accept=".zip" hidden onChange={(e) => setName(e.target.files?.[0]?.name ?? '')} />

          <label className="mb-2 block text-[11px] font-semibold" htmlFor="pw">
            Mật khẩu chứng chỉ
          </label>
          <input id="pw" name="password" type="password" autoComplete="off" placeholder="Nhập mật khẩu nếu có" disabled={busy} className={`${field} mb-6`} />

          {error && (
            <p role="alert" className="mb-3 text-xs text-[#b63838]">
              {error}
            </p>
          )}
          <button disabled={busy} className="w-full rounded-full bg-[#2a86ff] p-4 text-sm font-bold text-white transition hover:bg-[#1f78ee] disabled:opacity-60">
            {busy ? 'Đang kiểm tra…' : 'Kiểm tra'}
          </button>
          <p className="mt-3 text-center text-[9px] leading-[1.7] text-[#8a9587]">Chứng chỉ và mật khẩu chỉ dùng để đọc thông tin, không được lưu.</p>
        </form>
      </div>

      <div className="min-w-0 self-start">
        {!result ? (
          <p className="pt-10 text-center text-2xl font-semibold text-[#8f9a99] lg:pt-16">Chưa có kết quả</p>
        ) : (
          <ResultView r={result} />
        )}
      </div>
    </div>
  );
}

function ResultView({ r }: { r: Result }) {
  const c = r.certificate;
  const p = r.profile;
  const certOk = !c.expired && !c.notYetValid;
  const profOk = p && !p.error && !p.expired && p.matchesCert !== false;
  const good = certOk && (p ? profOk : true);
  return (
    <div className="space-y-4 text-xs">
      <div className={`rounded-2xl p-4 text-sm font-bold ${good ? 'bg-[#e7f6d4] text-[#2f5a13]' : 'bg-[#fde8e4] text-[#9a2b1b]'}`}>
        {good ? '✓ Chứng chỉ còn hạn sử dụng' : '✕ Chứng chỉ có vấn đề, xem chi tiết bên dưới'}
      </div>

      <Card title="Chứng chỉ (.p12)">
        <Row k="Tên" v={c.commonName || '—'} />
        <Row k="Loại" v={c.type || '—'} />
        <Row k="Tổ chức" v={c.organization || '—'} />
        <Row k="Team ID" v={c.teamId || '—'} mono />
        <Row k="Hiệu lực" v={`${date(c.notBefore)} → ${date(c.notAfter)}`} />
        <Row
          k="Còn lại"
          v={c.notYetValid ? 'Chưa đến ngày hiệu lực' : c.expired ? `Đã hết hạn ${-c.daysLeft} ngày` : `${c.daysLeft} ngày`}
          bad={c.expired || c.notYetValid}
        />
      </Card>

      {p && (
        <Card title="Hồ sơ cấp phép (.mobileprovision)">
          {p.error ? (
            <p className="text-[#b63838]">{p.error}</p>
          ) : (
            <>
              <Row k="Tên hồ sơ" v={p.name || '—'} />
              <Row k="Team" v={p.teamName || '—'} />
              <Row k="App ID" v={p.appId || '—'} mono />
              <Row k="Hết hạn" v={date(p.expires)} />
              <Row
                k="Còn lại"
                v={p.expired ? `Đã hết hạn ${-(p.daysLeft ?? 0)} ngày` : p.daysLeft != null ? `${p.daysLeft} ngày` : '—'}
                bad={p.expired}
              />
              <Row k="Thiết bị" v={p.allDevices ? 'Mọi thiết bị (chứng chỉ doanh nghiệp)' : `${p.devices ?? 0} thiết bị đã đăng ký`} />
              <Row k="Khớp với .p12" v={p.matchesCert ? 'Có' : 'Không, ký xong sẽ không cài được'} bad={p.matchesCert === false} />
            </>
          )}
        </Card>
      )}
      <p className="text-[10px] leading-[1.7] text-muted">
        Kết quả chỉ dựa trên nội dung và hạn dùng trong file. Công cụ chưa kiểm tra việc Apple có thu hồi chứng chỉ hay không, nên chứng chỉ vẫn có thể không dùng được dù còn hạn.
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[1.5px] text-accent">{title.toUpperCase()}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ k, v, mono, bad }: { k: string; v: string; mono?: boolean; bad?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-muted">{k}</span>
      <span className={`break-all text-right font-medium ${mono ? 'font-mono' : ''} ${bad ? 'text-[#b63838]' : ''}`}>{v}</span>
    </div>
  );
}
