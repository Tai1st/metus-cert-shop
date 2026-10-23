import { getMe } from '@/lib/api';
import MarketingTopbar from '@/components/MarketingTopbar';
import MarketingFooter from '@/components/MarketingFooter';

export default async function MarketingLayout({ children }: LayoutProps<'/'>) {
  const user = await getMe();
  return (
    <div className="flex min-h-full flex-col">
      <MarketingTopbar loggedIn={Boolean(user)} username={user?.username ?? null} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
