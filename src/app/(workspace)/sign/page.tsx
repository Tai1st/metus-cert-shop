import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import SignForm, { type QuickApp } from '@/components/SignForm';

export const dynamic = 'force-dynamic';

export default async function SignPage() {
  if (!(await getMe())) redirect('/login?next=/sign');
  const [status, quickApps] = await Promise.all([
    be<{ signerReady: boolean; maxMb: number; quotaLeft: number | null }>('/sign/status'),
    be<QuickApp[]>('/sign/quick-apps'),
  ]);
  return (
    <SignForm
      status={status.ok ? status.data : { signerReady: false, maxMb: 100, quotaLeft: null }}
      quickApps={quickApps.ok ? quickApps.data : []}
    />
  );
}
