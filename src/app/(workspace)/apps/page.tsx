import { be, getMe } from '@/lib/api';
import AppsView from '@/components/AppsView';

export const dynamic = 'force-dynamic';

interface AppItem {
  slug: string;
  kind: 'main' | 'quick';
  name: string;
  version?: string;
  bundleId?: string;
  minOs?: string;
  size?: number;
  canDownload: boolean;
  remote?: boolean;
}

export default async function AppsPage() {
  const [user, apps] = await Promise.all([getMe(), be<{ items: AppItem[] }>('/apps')]);
  const items = apps.ok ? apps.data.items : [];
  return <AppsView items={items} loggedIn={Boolean(user)} />;
}
