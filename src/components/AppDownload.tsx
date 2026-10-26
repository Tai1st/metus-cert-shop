'use client';

import { fmtSize } from '@/lib/format';
import type { AppInfo } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import InstallButton from './InstallButton';

/** Thẻ cài Metus Browser một chạm cho khách đã có chứng chỉ: tự ký bằng chứng chỉ của đơn này, không cần tải IPA/ký tay. */
export default function AppDownload({ app }: { app: AppInfo }) {
  const { t } = useI18n();
  if (!app.available || !app.canDownload) return null;
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-white p-[23px] text-sm shadow-[0_5px_24px_#21361703]">
      <h2 className="text-[11px] font-bold tracking-[2px] text-accent">{t('orderDetail.finalStep')}</h2>
      <div>
        <div className="font-semibold">{app.name}</div>
        <div className="text-xs text-muted">
          {t('orderDetail.version')} {app.version} · {fmtSize(app.size)}
          {app.minOs && ` · iOS ${app.minOs}+`}
        </div>
      </div>
      <InstallButton endpoint="/app/install" />
      <p className="text-[10px] text-muted">{t('orderDetail.udidNote')}</p>
    </div>
  );
}
