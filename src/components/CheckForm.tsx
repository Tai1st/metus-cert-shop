'use client';

import { useRef, useState } from 'react';
import { post } from '@/lib/client';
import { Use } from './IconSprite';
import { Card, InfoRow, PageHead, ResultEmpty } from './ui';

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
  'min-h-[43px] w-full rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-[10px] outline-none focus:border-[#9cba72] focus:shadow-[0_0_0_3px_#d0e5ad30]';
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
    <div>
      <PageHead title="Kiểm tra chứng chỉ" sub="Xem thông tin và trạng thái chứng chỉ trong một giao diện rõ ràng." />
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-[23px] shadow-[0_5px_24px_#21361703]">
          <div className="mb-[22px] flex items-center gap-2.5 text-xs font-semibold">
            <Use id="i-check" className="icon h-[18px] w-[18px] text-[#5b7150]" /> Thông tin chứng chỉ
          </div>
          <label className="mb-[9px] block text-[10px] font-medium">Nhập file chứng chỉ</label>
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

          <label className="mb-[9px] block text-[10px] font-medium" htmlFor="pw">
            Mật khẩu chứng chỉ
          </label>
          <input id="pw" name="password" type="password" autoComplete="off" placeholder="Nhập mật khẩu nếu có" disabled={busy} className={`${field} mb-5`} />

          <div className="mb-5 rounded-[10px] border border-[#e7efd9] bg-[#f2f7eb] p-3.5 text-[10px] leading-[1.9] text-[#8b9d75]">
            Chứng chỉ và mật khẩu chỉ dùng để đọc thông tin, không được lưu.
          </div>

          {error && (
            <p role="alert" className="mb-3 text-[10px] text-[#b45b45]">
              {error}
            </p>
          )}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2.5 rounded-[9px] bg-deep py-3 text-[10px] font-semibold text-white hover:bg-deep-dark disabled:opacity-60">
            {busy ? 'Đang kiểm tra…' : 'Xem kết quả'}
          </button>
        </form>

        <Card>
          <div className="mb-[22px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">Kết quả kiểm tra</h2>
          </div>
          {!result ? (
            <ResultEmpty icon={<Use id="i-check" className="icon h-8 w-8" />} title="Chưa có kết quả">
              Chọn chứng chỉ để xem thử thông tin, thời hạn và trạng thái.
            </ResultEmpty>
          ) : (
            <ResultView r={result} />
          )}
        </Card>
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
    <div className="space-y-4">
      <div className={`rounded-xl p-3.5 text-[11px] font-bold ${good ? 'bg-[#edf5e3] text-[#598436]' : 'bg-[#fbe9e6] text-[#9a2b1b]'}`}>
        {good ? '✓ Chứng chỉ còn hạn sử dụng' : '✕ Chứng chỉ có vấn đề, xem chi tiết bên dưới'}
      </div>

      <section>
        <h3 className="mb-1 text-[9px] font-bold tracking-[1.5px] text-accent">CHỨNG CHỈ (.P12)</h3>
        <InfoRow k="Tên" v={c.commonName || '—'} />
        <InfoRow k="Loại" v={c.type || '—'} />
        <InfoRow k="Tổ chức" v={c.organization || '—'} />
        <InfoRow k="Team ID" v={c.teamId || '—'} mono />
        <InfoRow k="Hiệu lực" v={`${date(c.notBefore)} → ${date(c.notAfter)}`} />
        <InfoRow k="Còn lại" v={c.notYetValid ? 'Chưa đến ngày hiệu lực' : c.expired ? `Đã hết hạn ${-c.daysLeft} ngày` : `${c.daysLeft} ngày`} />
      </section>

      {p && (
        <section className="border-t border-line pt-4">
          <h3 className="mb-1 text-[9px] font-bold tracking-[1.5px] text-accent">HỒ SƠ CẤP PHÉP (.MOBILEPROVISION)</h3>
          {p.error ? (
            <p className="text-[10px] text-[#b45b45]">{p.error}</p>
          ) : (
            <>
              <InfoRow k="Tên hồ sơ" v={p.name || '—'} />
              <InfoRow k="Team" v={p.teamName || '—'} />
              <InfoRow k="App ID" v={p.appId || '—'} mono />
              <InfoRow k="Hết hạn" v={date(p.expires)} />
              <InfoRow k="Còn lại" v={p.expired ? `Đã hết hạn ${-(p.daysLeft ?? 0)} ngày` : p.daysLeft != null ? `${p.daysLeft} ngày` : '—'} />
              <InfoRow k="Thiết bị" v={p.allDevices ? 'Mọi thiết bị (chứng chỉ doanh nghiệp)' : `${p.devices ?? 0} thiết bị đã đăng ký`} />
              <InfoRow k="Khớp với .p12" v={p.matchesCert ? 'Có' : 'Không, ký xong sẽ không cài được'} />
            </>
          )}
        </section>
      )}
      <p className="border-t border-line pt-4 text-[9px] leading-[1.8] text-muted">
        Kết quả chỉ dựa trên nội dung và hạn dùng trong file. Công cụ chưa kiểm tra việc Apple có thu hồi chứng chỉ hay không, nên chứng chỉ vẫn có thể không dùng được dù còn hạn.
      </p>
    </div>
  );
}
