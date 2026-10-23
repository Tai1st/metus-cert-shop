'use client';

import { fmtSize } from '@/lib/format';
import type { AppInfo } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

/** Thẻ tải Metus Browser (IPA chưa ký) cho khách đã có chứng chỉ. */
export default function AppDownload({ app }: { app: AppInfo }) {
  const { t } = useI18n();
  if (!app.available || !app.canDownload) return null;
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-white p-[23px] text-sm shadow-[0_5px_24px_#21361703]">
      <h2 className="text-[11px] font-bold tracking-[2px] text-accent">{t('orderDetail.finalStep')}</h2>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{app.name}</div>
          <div className="text-xs text-muted">
            {t('orderDetail.version')} {app.version} · {fmtSize(app.size)}
            {app.minOs && ` · iOS ${app.minOs}+`}
          </div>
        </div>
        <a
          href="/api/cert-shop/app/download"
          className="shrink-0 rounded-[10px] bg-mint px-4 py-2.5 text-xs font-bold text-[#20321a] hover:bg-mint-dark"
        >
          {t('orderDetail.downloadIpa')}
        </a>
      </div>
      <ol className="list-decimal space-y-1.5 border-t border-line pl-5 pt-3 text-xs leading-[1.8] text-muted">
        <li>{t('orderDetail.step1')}</li>
        <li>{t('orderDetail.step2')}</li>
        <li>{t('orderDetail.step3')}</li>
      </ol>
      <p className="text-[10px] text-muted">{t('orderDetail.udidNote')}</p>
    </div>
  );
}
