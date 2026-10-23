import Link from 'next/link';
import { be, fmtSize, getMe } from '@/lib/api';
import { Use } from '@/components/IconSprite';
import InstallButton from '@/components/InstallButton';
import { Card, PageHead, ResultEmpty } from '@/components/ui';

export const dynamic = 'force-dynamic';

interface AppItem {
  slug: string;
  kind: 'main' | 'quick';
  name: string;
  version?: string;
  bundleId?: string;
  minOs?: string;
  size?: number;
  canDownload: boolean;
}

// Ảnh cho app ký nhanh đã biết trước; app khác (admin thêm sau) dùng chữ cái đầu làm biểu tượng.
const QUICK_APP_ICONS: Record<string, string> = {
  metus: '/images/apps/metus.webp',
  esign: '/images/apps/esign.webp',
};

export default async function AppsPage() {
  const [user, apps] = await Promise.all([getMe(), be<{ items: AppItem[] }>('/apps')]);
  const items = apps.ok ? apps.data.items : [];
  const unlocked = items.some((a) => a.canDownload);

  return (
    <div>
      <PageHead title="Kho ứng dụng" sub="Khám phá và cài ứng dụng với chứng chỉ của bạn." />

      <div className="mb-[22px] flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#ecf3e2] p-[23px] sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold">
            {unlocked ? 'Chứng chỉ đã sẵn sàng cho trải nghiệm mới.' : 'Mở khóa kho ứng dụng của bạn.'}
          </h3>
          <p className="mt-2 text-[10px] leading-[1.8] text-[#8da078]">
            {unlocked ? 'Chọn một ứng dụng bên dưới để tải hoặc cài đặt.' : 'Hoàn tất đơn chứng chỉ để tiếp tục tải và cài ứng dụng.'}
          </p>
        </div>
        {!unlocked && (
          <Link href="/#install" className="shrink-0 rounded-[9px] bg-deep px-4 py-3 text-[10px] font-semibold text-white hover:bg-deep-dark">
            Chọn gói chứng chỉ ↗
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <ResultEmpty icon={<Use id="i-apps" className="icon h-8 w-8" />} title="Chưa có ứng dụng nào được phát hành">
            Vui lòng quay lại sau.
          </ResultEmpty>
        </Card>
      ) : (
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <AppTile key={a.slug} app={a} loggedIn={Boolean(user)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AppTile({ app, loggedIn }: { app: AppItem; loggedIn: boolean }) {
  const downloadHref = app.kind === 'main' ? '/api/cert-shop/app/download' : `/api/cert-shop/quick-apps/${app.slug}/download`;
  const installEndpoint = app.kind === 'main' ? '/app/install' : `/quick-apps/${app.slug}/install`;
  const icon = QUICK_APP_ICONS[app.slug];

  return (
    <Card>
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={58} height={58} className="mb-5 h-[58px] w-[58px] rounded-2xl object-cover" />
      ) : (
        <div className="mb-5 grid h-[58px] w-[58px] place-items-center rounded-2xl bg-gradient-to-br from-[#122b2c] to-[#245052] text-lg font-extrabold text-white">
          {app.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <h3 className="mb-1.5 text-[15px] font-semibold">{app.name}</h3>
      <p className="min-h-[38px] text-[10px] leading-[1.8] text-[#96a389]">
        {[app.version && `Phiên bản ${app.version}`, app.size && fmtSize(app.size), app.minOs && `iOS ${app.minOs} trở lên`].filter(Boolean).join(' · ') ||
          'Ứng dụng đi kèm chứng chỉ của bạn.'}
      </p>

      {!loggedIn ? (
        <Link href="/login?next=/apps" className="mt-[14px] block rounded-[9px] bg-deep py-3 text-center text-[10px] font-semibold text-white hover:bg-deep-dark">
          Đăng nhập để tải
        </Link>
      ) : !app.canDownload ? (
        <Link href="/#install" className="mt-[14px] block rounded-[9px] bg-deep py-3 text-center text-[10px] font-semibold text-white hover:bg-deep-dark">
          Mua chứng chỉ để mở khóa
        </Link>
      ) : (
        <div className="mt-[14px] grid grid-cols-2 gap-2">
          <a href={downloadHref} className="rounded-[9px] border border-line bg-white py-3 text-center text-[10px] font-semibold hover:bg-[#f3f6ed]">
            IPA
          </a>
          <InstallButton endpoint={installEndpoint} />
        </div>
      )}
    </Card>
  );
}
