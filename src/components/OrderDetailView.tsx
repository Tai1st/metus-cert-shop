'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Use } from './IconSprite';
import OrderActions from './OrderActions';
import { Badge, Card, InfoRow, Message } from './ui';
import { useI18n } from '@/lib/i18n';
import CopyButton from './CopyButton';
import { post } from '@/lib/client';
import type { Deposit } from './WalletView';

const POLL_MS = 3000;

interface Order {
  code: string;
  udid: string;
  planTitle: string;
  price: number;
  status: string;
  paymentMethod?: string;
  hasProvider: boolean;
  p12Password?: string;
  payment?: {
    bankId: string;
    accountNo: string;
    accountName: string;
    amount: number;
    content: string;
    qrUrl: string;
  };
  usdtPayment?: {
    networks: { key: string; label: string; feeUsdt: number }[];
    deposit: Deposit | null;
  };
}

export default function OrderDetailView({ order }: { order: Order }) {
  const { t } = useI18n();
  const router = useRouter();
  const pay = order.payment;
  const pending = order.status === 'awaiting_payment';
  const provisioning = order.status === 'provisioning' || order.status === 'paid';
  const active = order.status === 'completed';
  const step = pending ? 1 : active ? 3 : 2;
  const watching = pending || provisioning;

  // Khách vừa chuyển khoản/đang chờ cấp chứng chỉ: tự làm mới để không phải F5 tay.
  // "provisioning" còn chủ động kéo trạng thái mới nhất từ nhà cung cấp (webhook có thể chưa tới).
  useEffect(() => {
    if (!watching) return;
    const id = setInterval(() => {
      if (order.status === 'provisioning') void post(`/orders/${order.code}/sync`);
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [watching, order.status, order.code, router]);

  return (
    <div>
      <div className="mb-[29px] flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="mb-[9px] text-2xl font-bold tracking-tight sm:text-[29px] sm:tracking-[-1.1px]">{t('orderDetail.orderN', { code: order.code })}</h1>
          <p className="text-[11px] text-muted">
            <Link href="/orders">← {t('workspace.navOrders')}</Link>
          </p>
        </div>
        <Badge status={order.status} />
      </div>

      {order.status !== 'failed' && order.status !== 'cancelled' && (
        <Card className="mb-5 flex items-center gap-3 overflow-auto">
          {[t('orderDetail.stepPay'), t('orderDetail.stepReceiveCert'), t('orderDetail.stepInstallApp')].map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            return (
              <div key={label} className="flex shrink-0 items-center gap-2.5">
                <span className={`flex items-center gap-2.5 text-[10px] ${current ? 'font-semibold text-ink' : done ? 'text-[#709442]' : 'text-[#a2ae96]'}`}>
                  <b
                    className={`grid h-[25px] w-[25px] place-items-center rounded-full text-[9px] font-medium ${
                      current ? 'bg-deep text-lime' : done ? 'bg-[#e6f0d7]' : 'bg-[#f1f5e9]'
                    }`}
                  >
                    {done ? '✓' : n}
                  </b>
                  {label}
                </span>
                {i < 2 && <span className="h-px w-8 bg-line" />}
              </div>
            );
          })}
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Card>
            <div className="mb-[22px] flex items-center justify-between">
              <h2 className="text-[15px] tracking-[-0.4px]">{t('orderDetail.orderInfo')}</h2>
              <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#e5efce] text-[#719b3f]">
                <Use id="i-orders" className="icon h-[18px] w-[18px]" />
              </span>
            </div>
            <InfoRow k={t('checkout.certPlan')} v={order.planTitle} />
            <div className="my-[17px] flex items-center justify-between gap-5 text-[10px]">
              <span className="text-[#94a086]">UDID</span>
              <span className="flex items-center gap-1.5">
                <strong className="overflow-wrap-anywhere text-right font-mono font-medium text-[#4c6040]">{order.udid}</strong>
                <CopyButton value={order.udid} />
              </span>
            </div>
            <InfoRow k={t('checkout.total')} v={`${order.price.toLocaleString('vi-VN')}đ`} />
            {order.p12Password && (
              <div className="my-[17px] flex items-center justify-between gap-5 text-[10px]">
                <span className="text-[#94a086]">{t('orderDetail.p12Password')}</span>
                <span className="flex items-center gap-1.5">
                  <strong className="overflow-wrap-anywhere text-right font-mono font-medium text-[#4c6040]">{order.p12Password}</strong>
                  <CopyButton value={order.p12Password} />
                </span>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="mb-[22px] flex items-center justify-between">
            <h2 className="text-[15px] tracking-[-0.4px]">
              {active ? t('orderDetail.readyTitle') : pending ? t('orderDetail.payTitle') : t('orderDetail.preparingTitle')}
            </h2>
            <Use id={active ? 'i-check' : pending ? 'i-clock' : 'i-sign'} className="icon h-5 w-5 text-[#88a268]" />
          </div>

          {pending && order.paymentMethod === 'usdt' && order.usdtPayment && (
            <UsdtOrderPayment code={order.code} info={order.usdtPayment} onCreated={() => router.refresh()} />
          )}
          {pending && order.paymentMethod !== 'usdt' && pay && (
            <div className="space-y-3">
              {pay.qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pay.qrUrl} alt="VietQR" className="mx-auto w-56 rounded-lg" />
              ) : (
                <p className="text-[11px] text-[#b45b45]">{t('orderDetail.noBankConfigured')}</p>
              )}
              <InfoRow k={t('orderDetail.bank')} v={pay.bankId} />
              <InfoRow k={t('orderDetail.accountNo')} v={pay.accountNo} mono />
              <InfoRow k={t('orderDetail.accountName')} v={pay.accountName} />
              <InfoRow k={t('orderDetail.amount')} v={`${pay.amount.toLocaleString('vi-VN')}đ`} />
              <InfoRow k={t('orderDetail.content')} v={pay.content} mono />
              <Message amber>{t('orderDetail.payNote')}</Message>
            </div>
          )}
          {(order.status === 'paid' || order.status === 'provisioning') && <Message>{t('orderDetail.processingNote')}</Message>}
          {order.status === 'failed' && <Message amber>{t('orderDetail.failedNote', { code: order.code })}</Message>}
          {watching && (
            <p className="mt-3 flex items-center gap-2 text-[10px] text-muted">
              <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-[#cfe0bd] border-t-[#5d7e3d]" />
              {t('orderDetail.autoChecking')}
            </p>
          )}

          {active && (
            <div className="mt-4">
              <OrderActions code={order.code} status={order.status} hasProvider={order.hasProvider} />
            </div>
          )}
          <p className="mt-4 text-[9px] text-muted">
            {t('orderDetail.needHelp')}{' '}
            <a href="https://t.me/metusvn" target="_blank" rel="noreferrer">
              {t('orderDetail.contactTelegram')}
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}

/** Trả trực tiếp bằng USDT cho đơn: chọn mạng (nếu chưa có lượt chuyển) rồi hiện QR/đếm ngược. */
function UsdtOrderPayment({
  code,
  info,
  onCreated,
}: {
  code: string;
  info: { networks: { key: string; label: string; feeUsdt: number }[]; deposit: Deposit | null };
  onCreated: () => void;
}) {
  const { t } = useI18n();
  const [network, setNetwork] = useState(info.networks[0]?.key ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const d = info.deposit;
  const active = d && d.status === 'pending';

  useEffect(() => {
    if (!active) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((new Date(d.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, d]);

  if (!active) {
    return (
      <div className="space-y-3">
        {info.networks.length === 0 ? (
          <p className="text-[11px] text-[#b45b45]">{t('orderDetail.usdtNoNetwork')}</p>
        ) : (
          <>
            <div>
              <label className="mb-2 block text-[11px] font-semibold">{t('orderDetail.usdtChooseNetwork')}</label>
              <div className="grid grid-cols-2 gap-2">
                {info.networks.map((n) => (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => setNetwork(n.key)}
                    className={`rounded-xl border py-2.5 text-center text-xs font-bold ${
                      network === n.key ? 'border-[#4f733d] bg-mint text-[#20321a]' : 'border-[#cfe0bd] bg-tint text-ink'
                    }`}
                  >
                    {n.label}
                    <span className="ml-1 text-[9px] font-normal text-muted">{t('orderDetail.usdtFeeUnit', { fee: n.feeUsdt })}</span>
                  </button>
                ))}
              </div>
            </div>
            {error && <p role="alert" className="text-[11px] text-[#b45b45]">{error}</p>}
            <button
              type="button"
              disabled={busy || !network}
              onClick={async () => {
                setBusy(true);
                setError('');
                const r = await post(`/orders/${code}/usdt-payment`, { network });
                setBusy(false);
                if (!r.ok) return setError(r.error);
                onCreated();
              }}
              className="flex w-full items-center justify-center rounded-xl bg-mint py-3.5 text-xs font-bold text-[#20321a] hover:bg-mint-dark disabled:opacity-50"
            >
              {busy ? t('orderDetail.usdtCreating') : t('orderDetail.usdtCreateBtn')}
            </button>
          </>
        )}
      </div>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(d.address)}`;

  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl} alt={t('wallet.qrAlt')} className="mx-auto h-45 w-45 rounded-lg" />
      <InfoRow k={t('wallet.expiresIn')} v={`${mm}:${ss}`} mono />
      <InfoRow k={t('wallet.receivingNetwork')} v={d.networkLabel} />
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="shrink-0 text-[#94a086]">{t('wallet.exactAmount')}</span>
        <span className="flex items-center gap-1.5">
          <strong className="overflow-wrap-anywhere text-right font-mono font-medium text-[#4c6040]">{d.expectedAmount}</strong>
          <CopyButton value={d.expectedAmount} />
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="shrink-0 text-[#94a086]">{t('wallet.address')}</span>
        <span className="flex items-center gap-1.5 overflow-hidden">
          <strong className="truncate font-mono font-medium text-[#4c6040]">{d.address}</strong>
          <CopyButton value={d.address} />
        </span>
      </div>
      <Message amber>{t('wallet.warningNote', { network: d.networkLabel })}</Message>
    </div>
  );
}
