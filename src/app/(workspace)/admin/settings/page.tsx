import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import SettingsForm, { type ShopSettingsView } from '@/components/SettingsForm';
import AdminSettingsHead, { AdminSettingsError } from '@/components/AdminSettingsHead';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const me = await getMe();
  if (!me?.isAdmin) redirect('/');
  const r = await be<ShopSettingsView>('/admin/settings');

  return (
    <div>
      <AdminSettingsHead />
      {r.ok ? <SettingsForm initial={r.data} /> : <AdminSettingsError />}
    </div>
  );
}
