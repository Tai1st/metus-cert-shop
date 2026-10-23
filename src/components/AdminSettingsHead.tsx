'use client';

import Link from 'next/link';
import { PageHead } from './ui';
import { useI18n } from '@/lib/i18n';

export function AdminSettingsError() {
  const { t } = useI18n();
  return <p className="text-[11px] text-[#b45b45]">{t('admin.settingsLoadError')}</p>;
}

export default function AdminSettingsHead() {
  const { t } = useI18n();
  return (
    <PageHead
      title={t('admin.settingsTitle')}
      sub={t('admin.settingsSub')}
      action={
        <Link href="/admin" className="rounded-[9px] border border-line bg-white px-4 py-3 text-[10px] font-semibold hover:bg-[#f3f6ed]">
          ← {t('admin.backToOrders')}
        </Link>
      }
    />
  );
}
