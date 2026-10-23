import { be, getMe, type Plan } from '@/lib/api';
import Storefront from '@/components/Storefront';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: PageProps<'/'>) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');
  const token = str(sp.e);
  const initialPlan = str(sp.plan);

  const [me, plans, enroll] = await Promise.all([
    getMe(),
    be<{ plans: Plan[] }>('/plans'),
    // UDID chỉ có sau khi iPhone cài hồ sơ và được chuyển hướng về /?e=<token>
    token
      ? be<{ udid: string; product?: string; version?: string }>(`/udid/enroll/${encodeURIComponent(token)}`)
      : Promise.resolve(null),
  ]);

  return (
    <Storefront
      plans={plans.ok ? plans.data.plans : []}
      loggedIn={Boolean(me)}
      enroll={me && enroll?.ok ? { token, ...enroll.data } : null}
      initialPlan={initialPlan}
    />
  );
}
