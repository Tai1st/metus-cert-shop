import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import WalletView, { type Deposit, type WalletInfo } from '@/components/WalletView';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const user = await getMe();
  if (!user) redirect('/login?next=/wallet');
  const [info, deposits] = await Promise.all([
    be<WalletInfo>('/wallet'),
    be<{ deposits: Deposit[] }>('/wallet/deposits'),
  ]);
  return (
    <WalletView
      info={info.ok ? info.data : null}
      deposits={deposits.ok ? deposits.data.deposits : []}
    />
  );
}
