import Link from 'next/link';
import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import SettingsForm, { type ShopSettingsView } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const me = await getMe();
  if (!me?.isAdmin) redirect('/');
  const r = await be<ShopSettingsView>('/admin/settings');

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Cài đặt shop</h1>
        <Link href="/admin" className="text-sm text-indigo-600 hover:underline">
          ← Quản lý đơn
        </Link>
      </div>
      {r.ok ? <SettingsForm initial={r.data} /> : <p className="text-sm text-red-600">Không tải được cấu hình.</p>}
    </div>
  );
}
