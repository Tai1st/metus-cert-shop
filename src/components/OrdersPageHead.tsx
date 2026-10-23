'use client';

import { BtnLink, PageHead } from './ui';
import { useI18n } from '@/lib/i18n';

export default function OrdersPageHead() {
  const { t } = useI18n();
  return (
    <PageHead
      title={t('orders.pageTitle')}
      sub={t('orders.pageSub')}
      action={<BtnLink href="/#install">+ &nbsp; {t('orders.newOrder')}</BtnLink>}
    />
  );
}
