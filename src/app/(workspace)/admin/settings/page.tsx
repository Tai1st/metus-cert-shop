import Link from 'next/link';
import { redirect } from 'next/navigation';
import { be, getMe } from '@/lib/api';
import SettingsForm, { type ShopSettingsView } from '@/components/SettingsForm';
import { PageHead } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const me = await getMe();
  if (!me?.isAdmin) redirect('/');
  const r = await be<ShopSettingsView>('/admin/settings');

  return (
    <div>
      <PageHead
        title="Cài đặt shop"
        sub="Thông tin thanh toán, giá bán và kết nối nhà cung cấp."
        action={
          <Link href="/admin" className="rounded-[9px] border border-line bg-white px-4 py-3 text-[10px] font-semibold hover:bg-[#f3f6ed]">
            ← Quản lý đơn
          </Link>
        }
      />
      {r.ok ? <SettingsForm initial={r.data} /> : <p className="text-[11px] text-[#b45b45]">Không tải được cấu hình.</p>}
    </div>
  );
}
