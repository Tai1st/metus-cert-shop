'use client';

import Link from 'next/link';
import { vnd } from '@/lib/format';
import type { AppInfo } from '@/lib/api';
import AdminAppUpload from './AdminAppUpload';
import AdminConfirm from './AdminConfirm';
import { Use } from './IconSprite';
import { Badge, Card, PageHead, Stat } from './ui';
import { useI18n } from '@/lib/i18n';

interface Stats {
  counts: Record<string, number>;
  totalOrders: number;
  ordersToday: number;
  revenue: number;
  profit: number;
  providerWallet: { wallet: number; currency: string } | null;
}

interface Row {
  code: string;
  username: string;
  udid: string;
  planTitle: string;
  price: number;
  status: string;
  error?: string;
  createdAt: string;
}

export default function AdminView({
  stats,
  items,
  total,
  pages,
  page,
  status,
  q,
  app,
  link,
}: {
  stats: Stats | null;
  items: Row[];
  total: number;
  pages: number;
  page: number;
  status: string;
  q: string;
  app: { ok: boolean; data: AppInfo } | { ok: false };
  link: (p: number) => string;
}) {
  const { t } = useI18n();
  const STATUS_LABEL: Record<string, string> = {
    awaiting_payment: t('common.status.awaiting_payment'),
    paid: t('common.status.paid'),
    provisioning: t('common.status.provisioning'),
    completed: t('common.status.completed'),
    failed: t('common.status.failed'),
    cancelled: t('common.status.cancelled'),
  };
  const s = stats;

  return (
    <div>
      <PageHead
        title={t('admin.pageTitle')}
        sub={t('admin.pageSub')}
        action={
          <Link href="/admin/settings" className="rounded-[9px] border border-line bg-white px-4 py-3 text-[10px] font-semibold hover:bg-[#f3f6ed]">
            {t('admin.settingsLink')}
          </Link>
        }
      />

      {s && (
        <div className="mb-[22px] grid grid-cols-2 gap-[15px] lg:grid-cols-4">
          <Stat icon={<Use id="i-zap" className="icon h-[15px] w-[15px]" />} title={t('admin.statRevenue')} value={vnd(s.revenue)} caption={t('admin.statRevenueCaption')} />
          <Stat icon={<Use id="i-check" className="icon h-[15px] w-[15px]" />} title={t('admin.statProfit')} value={vnd(s.profit)} caption={t('admin.statProfitCaption')} />
          <Stat icon={<Use id="i-clock" className="icon h-[15px] w-[15px]" />} title={t('admin.statToday')} value={String(s.ordersToday)} caption={t('admin.statTodayCaption')} />
          <Stat
            icon={<Use id="i-shield" className="icon h-[15px] w-[15px]" />}
            title={t('admin.statWallet')}
            value={s.providerWallet ? `${s.providerWallet.wallet.toLocaleString('vi-VN')} ${s.providerWallet.currency}` : '—'}
            caption="chungchi.store"
          />
        </div>
      )}

      <div className="mb-[22px]">
        <AdminAppUpload app={app.ok ? app.data : { available: false }} />
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2 text-[9px]">
          <Link href="/admin" className={`rounded-full border px-3 py-1.5 ${!status ? 'border-[#9fbc77] bg-[#f0f7e7] text-[#537638]' : 'border-line bg-white'}`}>
            {t('orders.filterAll')}
            {s ? ` (${s.totalOrders})` : ''}
          </Link>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <Link
              key={k}
              href={`/admin?status=${k}`}
              className={`rounded-full border px-3 py-1.5 ${status === k ? 'border-[#9fbc77] bg-[#f0f7e7] text-[#537638]' : 'border-line bg-white'}`}
            >
              {v}
              {s?.counts[k] ? ` (${s.counts[k]})` : ''}
            </Link>
          ))}
        </div>

        <form className="mb-5 flex gap-2" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder={t('admin.searchPlaceholder')}
            className="min-h-[43px] flex-1 rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-[10px] outline-none focus:border-[#9cba72]"
          />
          <button className="rounded-[9px] bg-deep px-4 text-[10px] font-semibold text-white hover:bg-deep-dark">{t('admin.search')}</button>
        </form>

        {items.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-muted">{t('admin.noOrders')}</p>
        ) : (
          <div className="space-y-2.5">
            {items.map((o) => (
              <div key={o.code} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 text-[11px]">
                <Link href={`/orders/${o.code}`} className="min-w-0">
                  <div className="font-semibold">
                    {o.code} · {o.planTitle} · {vnd(o.price)}
                  </div>
                  <div className="truncate text-[9px] text-muted">
                    {o.username} · <span className="font-mono">{o.udid}</span> · {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </div>
                  {o.error && <div className="text-[9px] text-[#b45b45]">{o.error}</div>}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge status={o.status} />
                  {o.status === 'awaiting_payment' && (
                    <>
                      <AdminConfirm code={o.code} action="confirm" label={t('admin.actionReceivedPayment')} />
                      <AdminConfirm code={o.code} action="cancel" label={t('admin.actionCancel')} />
                    </>
                  )}
                  {o.status === 'paid' && <AdminConfirm code={o.code} action="confirm" label={t('admin.actionResend')} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3 text-[10px]">
            {page > 1 && <Link href={link(page - 1)}>← {t('admin.prevPage')}</Link>}
            <span className="text-muted">{t('admin.pageOf', { page, pages })}</span>
            {page < pages && <Link href={link(page + 1)}>{t('admin.nextPage')} →</Link>}
          </div>
        )}
      </Card>
    </div>
  );
}
