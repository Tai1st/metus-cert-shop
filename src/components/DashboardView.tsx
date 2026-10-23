'use client';

import Link from 'next/link';
import { Use } from './IconSprite';
import { Badge, BtnLink, Card, PageHead, Stat } from './ui';
import { useI18n } from '@/lib/i18n';

interface OrderRow {
  code: string;
  planTitle: string;
  udid: string;
  device: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function DashboardView({ orders, completed, pending, latestCert }: { orders: OrderRow[]; completed: OrderRow[]; pending: OrderRow[]; latestCert?: OrderRow }) {
  const { t } = useI18n();
  const QUICK = [
    { href: '/sign', icon: 'i-sign', title: t('dashboard.quickSignTitle'), d: t('dashboard.quickSignDesc') },
    { href: '/check', icon: 'i-check', title: t('dashboard.quickCheckTitle'), d: t('dashboard.quickCheckDesc') },
    { href: '/lookup', icon: 'i-lookup', title: t('dashboard.quickLookupTitle'), d: t('dashboard.quickLookupDesc') },
  ] as const;

  return (
    <div>
      <PageHead
        title={t('dashboard.pageTitle')}
        sub={t('dashboard.pageSub')}
        action={<BtnLink href="/#install">+ &nbsp; {t('dashboard.buyCert')}</BtnLink>}
      />

      <div className="mb-[23px] grid grid-cols-2 gap-[15px] lg:grid-cols-4">
        <Stat icon={<Use id="i-orders" className="icon h-[15px] w-[15px]" />} title={t('dashboard.statTotalOrders')} value={String(orders.length)} caption={t('dashboard.statTotalOrdersCaption')} />
        <Stat icon={<Use id="i-check" className="icon h-[15px] w-[15px]" />} title={t('dashboard.statActiveCerts')} value={String(completed.length)} caption={t('dashboard.statActiveCertsCaption')} />
        <Stat icon={<Use id="i-phone" className="icon h-[15px] w-[15px]" />} title={t('dashboard.statDevices')} value={String(orders.length)} caption={t('dashboard.statDevicesCaption')} />
        <Stat icon={<Use id="i-clock" className="icon h-[15px] w-[15px]" />} title={t('dashboard.statPending')} value={String(pending.length)} caption={t('dashboard.statPendingCaption')} />
      </div>

      <div className="mb-[22px] grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative min-h-[195px] overflow-hidden rounded-[17px] bg-deep p-7 text-white">
          <div className="pointer-events-none absolute -bottom-[140px] -right-[50px] h-[300px] w-[300px] rounded-full border border-[#c5df9420] shadow-[0_0_0_35px_#c5df9408,0_0_0_70px_#c5df9406]" />
          <div className="relative text-[8px] font-semibold tracking-[1.6px] text-[#9baf89]">METUS BROWSER / iOS</div>
          <h2 className="relative my-3.5 text-[23px] leading-[1.4] tracking-[-0.8px] sm:text-[25px]">
            {t('dashboard.heroLine1')}
            <br />
            {t('dashboard.heroLine2')}
          </h2>
          <p className="relative mb-5 max-w-[350px] text-[10px] leading-[1.8] text-[#a8bc98]">{t('dashboard.heroDesc')}</p>
          <Link href="/apps" className="relative inline-flex items-center gap-2.5 rounded-[9px] bg-lime px-4 py-3 text-[10px] font-semibold text-[#2b461a] hover:bg-lime-dark">
            {t('dashboard.exploreApps')} <Use id="i-arrow" className="icon h-[15px] w-[15px]" />
          </Link>
        </div>

        <Card className="bg-gradient-to-[130deg] from-[#f1f7e8] to-white">
          <div className="mb-[18px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">{t('dashboard.yourCert')}</h2>
            {latestCert && <Badge status="completed" />}
          </div>
          {latestCert ? (
            <>
              <div className="my-[18px] flex items-center gap-3">
                <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#e5efce] text-[#719b3f]">
                  <Use id="i-check" className="icon h-[18px] w-[18px]" />
                </span>
                <div>
                  <strong className="text-sm">{latestCert.planTitle}</strong>
                  <small className="mt-1.5 block text-[9px] text-[#8d9c7c]">
                    {latestCert.device} · {latestCert.udid}
                  </small>
                </div>
              </div>
              <Link href={`/orders/${latestCert.code}`} className="text-[9px] text-[#809368]">
                {t('dashboard.viewCertInfo')}
              </Link>
            </>
          ) : (
            <p className="py-6 text-center text-[10px] leading-[1.8] text-muted">{t('dashboard.noActiveCert')}</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-[22px] flex items-center justify-between">
          <h2 className="text-[15px] tracking-[-0.4px]">{t('dashboard.recentOrders')}</h2>
          <Link href="/orders" className="text-[9px] text-[#809368]">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-muted">{t('dashboard.noOrdersYet')}</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">{t('dashboard.colCode')}</th>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">{t('dashboard.colPlan')}</th>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">{t('orders.colPayment')}</th>
                  <th className="bg-[#f8faf5] px-[15px] py-[13px] text-[8px] font-medium tracking-wide text-[#a0aa94]">{t('orders.colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.code} className="border-b border-[#f0f3eb] last:border-0">
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">
                      <Link href={`/orders/${o.code}`} className="font-semibold">
                        {o.code}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">{o.planTitle}</td>
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">{o.price.toLocaleString('vi-VN')}đ</td>
                    <td className="whitespace-nowrap px-[15px] py-[19px] text-[10px]">
                      <Badge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-[21px] grid gap-[15px] sm:grid-cols-3">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="flex items-center gap-3 rounded-[13px] border border-line bg-white p-[21px] hover:bg-[#f0f6e8]">
            <Use id={q.icon} className="icon h-5 w-5 text-[#88a268]" />
            <span>
              <strong className="block text-[11px]">{q.title}</strong>
              <small className="mt-[5px] block text-[8px] text-[#a1ad94]">{q.d}</small>
            </span>
            <span className="ml-auto text-[#a9b49f]">↗</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
