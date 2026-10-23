'use client';

import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import { useI18n } from '@/lib/i18n';

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      className="text-slate-500 hover:text-slate-900"
      onClick={async () => {
        await post('/auth/logout');
        router.push('/');
        router.refresh();
      }}
    >
      {t('common.logout')}
    </button>
  );
}
