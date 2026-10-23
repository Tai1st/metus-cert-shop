import Link from 'next/link';
import { be, fmtSize, getMe, type AppInfo } from '@/lib/api';
import InstallButton from '@/components/InstallButton';

export const dynamic = 'force-dynamic';

export default async function AppsPage() {
  const user = await getMe();
  const app = user ? await be<AppInfo>('/app') : null;

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="mb-8 text-center">
        <h1 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">
          <span className="bg-gradient-to-r from-[#1d7cf2] to-[#f26b1d] bg-clip-text text-transparent">Kho ứng dụng</span>
        </h1>
        <p className="mt-1 text-xs text-muted">Ứng dụng đi kèm chứng chỉ bạn đã mua</p>
      </div>

      {!user ? (
        <Locked
          title="Đăng nhập để xem kho ứng dụng"
          desc="Ứng dụng chỉ mở khóa cho tài khoản đã mua chứng chỉ."
          cta={{ href: '/login?next=/apps', label: 'Đăng nhập' }}
        />
      ) : !app?.ok || !app.data.available ? (
        <Locked title="Chưa có ứng dụng nào được phát hành" desc="Vui lòng quay lại sau." />
      ) : !app.data.canDownload ? (
        <Locked
          title="Mua chứng chỉ để mở khóa"
          desc={`${app.data.name} đã sẵn sàng, nhưng bạn cần một đơn chứng chỉ đã hoàn tất mới tải được.`}
          cta={{ href: '/#install', label: 'Mua chứng chỉ' }}
        />
      ) : (
        <AppCard app={app.data} />
      )}
    </div>
  );
}

function Locked({ title, desc, cta }: { title: string; desc: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-[26px] border border-line bg-white p-8 text-center shadow-[0_2px_18px_#1428280a]">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1ee] text-2xl text-[#8f9a99]">🔒</div>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-1.5 text-xs leading-[1.7] text-muted">{desc}</p>
      {cta && (
        <Link href={cta.href} className="mt-5 inline-block rounded-full bg-mint px-6 py-3 text-xs font-bold text-[#20321a] hover:bg-mint-dark">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function AppCard({ app }: { app: AppInfo }) {
  return (
    <div className="rounded-[26px] border border-line bg-white p-6 shadow-[0_2px_18px_#1428280a] sm:p-7">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-[#122b2c] to-[#245052]">
          <svg viewBox="0 0 100 100" fill="none" className="h-9 w-9">
            <circle cx="50" cy="50" r="33" stroke="#fff" strokeWidth="3" />
            <ellipse cx="50" cy="50" rx="17" ry="33" stroke="#fff" strokeWidth="2" />
            <path d="M18 40h64M18 60h64" stroke="#fff" strokeWidth="2" />
            <path d="M28 65V39l11 13 11-13 11 13 11-13v26" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold">{app.name}</div>
          <div className="text-xs text-muted">
            Phiên bản {app.version} · {fmtSize(app.size)}
            {app.minOs && ` · iOS ${app.minOs} trở lên`}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href="/api/cert-shop/app/download"
          className="flex items-center justify-center rounded-full border border-[#d8dfd9] bg-white py-3.5 text-sm font-bold hover:bg-[#edf2e9]"
        >
          IPA
        </a>
        <InstallButton />
      </div>

      <div className="mt-6 space-y-3 border-t border-line pt-5 text-xs leading-[1.8] text-muted">
        <p>
          <b className="text-ink">Cài đặt</b> — tự ký app bằng chứng chỉ bạn đã mua và mở thẳng màn hình cài đặt trên Safari, không cần làm gì
          thêm.
        </p>
        <p>
          <b className="text-ink">IPA</b> — chỉ tải file gốc chưa ký. Dùng khi bạn muốn tự chọn chứng chỉ khác ở trang{' '}
          <Link href="/sign" className="font-semibold text-accent">
            Ký IPA
          </Link>
          .
        </p>
      </div>
      <p className="mt-3 text-[10px] text-muted">Ứng dụng chỉ chạy trên đúng thiết bị có UDID đã đăng ký trong đơn chứng chỉ của bạn.</p>
    </div>
  );
}
