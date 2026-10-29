'use client';

import { useEffect, useRef, useState } from 'react';
import { post } from '@/lib/client';
import { vnd } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { Use } from './IconSprite';
import CopyButton from './CopyButton';
import { Badge, Card, PageHead, ResultEmpty } from './ui';

export interface WalletInfo {
  balanceVnd: number;
  network: string;
  networkLabel: string;
  address: string | null;
  serviceFeeUsdt: number;
  minUsdt: number;
  maxUsdt: number;
  usdtVndRate: number;
}

export interface Deposit {
  id: string;
  network: string;
  networkLabel: string;
  address: string;
  requestedAmount: string;
  serviceFee: string;
  expectedAmount: string;
  creditAmount: string;
  status: string;
  expiresAt: string;
  creditedVnd?: number;
}

export default function WalletView({ info, deposits }: { info: WalletInfo | null; deposits: Deposit[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(deposits);
  const [refreshBalance, setRefreshBalance] = useState(info?.balanceVnd ?? 0);

  if (!info) {
    return (
      <Card>
        <ResultEmpty icon={<Use id="i-wallet" className="icon h-8 w-8" />} title={t('wallet.loadFailed')}>
          {t('wallet.loadFailedRetry')}
        </ResultEmpty>
      </Card>
    );
  }

  return (
    <div>
      <PageHead title={t('wallet.pageTitle')} sub={t('wallet.pageSub')} />

      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="mb-1 text-[10px] font-bold tracking-[2px] text-accent">{t('wallet.balanceLabel')}</div>
            <div className="text-3xl font-bold tracking-tight">{vnd(refreshBalance)}</div>
          </div>
          {info.address ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-5 flex items-center justify-center gap-2 rounded-[10px] bg-mint py-3 text-xs font-bold text-[#20321a] hover:bg-mint-dark"
            >
              <Use id="i-wallet" className="icon h-4 w-4" />
              {t('wallet.depositBtn')}
            </button>
          ) : (
            <p className="mt-5 text-[10px] text-muted">{t('wallet.noAddress')}</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-[13px] font-semibold">{t('wallet.infoTitle')}</h2>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-muted">{t('wallet.infoNetwork')}</span><strong>{info.networkLabel}</strong></div>
            <div className="flex justify-between"><span className="text-muted">{t('wallet.infoRange')}</span><strong>{info.minUsdt} – {info.maxUsdt} USDT</strong></div>
            <div className="flex justify-between"><span className="text-muted">{t('wallet.infoFee')}</span><strong>{t('wallet.infoFeeUnit', { fee: info.serviceFeeUsdt })}</strong></div>
            <div className="flex justify-between"><span className="text-muted">{t('wallet.infoRate')}</span><strong>{t('wallet.infoRateValue', { vnd: vnd(info.usdtVndRate) })}</strong></div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-[13px] font-semibold">{t('wallet.historyTitle')}</h2>
        {list.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-muted">{t('wallet.historyEmpty')}</p>
        ) : (
          <div className="space-y-2">
            {list.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3 text-[11px]">
                <div className="min-w-0">
                  <div className="font-semibold">{d.expectedAmount} USDT · {d.networkLabel}</div>
                  <div className="truncate text-[9px] text-muted">
                    {d.creditedVnd
                      ? t('wallet.historyCredited', { vnd: vnd(d.creditedVnd) })
                      : t('wallet.historyWillCredit', { vnd: vnd(Number(d.creditAmount) * info.usdtVndRate) })}
                  </div>
                </div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {open && (
        <DepositModal
          info={info}
          onClose={() => setOpen(false)}
          onCredited={(amount) => setRefreshBalance((b) => b + amount)}
          onCreated={(d) => setList((prev) => [d, ...prev])}
        />
      )}
    </div>
  );
}

function DepositModal({
  info,
  onClose,
  onCredited,
  onCreated,
}: {
  info: WalletInfo;
  onClose: () => void;
  onCredited: (amountVnd: number) => void;
  onCreated: (d: Deposit) => void;
}) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!deposit || deposit.status !== 'pending') return;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((new Date(deposit.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const t1 = setInterval(tick, 1000);
    return () => clearInterval(t1);
  }, [deposit]);

  useEffect(() => {
    if (!deposit || deposit.status !== 'pending') return;
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/cert-shop/wallet/deposits/${deposit.id}`);
      if (!r.ok) return;
      const json = (await r.json()) as { ok: boolean; data?: Deposit };
      if (!json.ok || !json.data) return;
      setDeposit(json.data);
      if (json.data.status === 'credited' && json.data.creditedVnd) {
        onCredited(json.data.creditedVnd);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [deposit, onCredited]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n < info.minUsdt || n > info.maxUsdt) {
      setError(t('wallet.amountRangeError', { min: info.minUsdt, max: info.maxUsdt }));
      return;
    }
    setBusy(true);
    setError('');
    const r = await post<Deposit>('/wallet/deposits', { requestedAmount: n });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setDeposit(r.data);
    onCreated(r.data);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const qrUrl = deposit ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(deposit.address)}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c202675] p-4 backdrop-blur-[6px]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="relative max-h-[92vh] w-105 max-w-full overflow-y-auto rounded-[22px] bg-white p-6 shadow-[0_30px_90px_#0003]">
        <button onClick={onClose} aria-label={t('common.close')} className="absolute right-4 top-3.5 h-7 w-7 rounded-full bg-[#f2f5ef] text-[#64715e]">
          ×
        </button>
        <h2 className="mb-1 mt-1 text-center text-lg font-bold tracking-tight">{t('wallet.modalTitle')}</h2>
        <p className="mb-5 text-center text-[11px] text-muted">{t('wallet.modalSub', { network: info.networkLabel })}</p>

        {!deposit ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold">{t('wallet.amountLabel')}</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder={`${info.minUsdt} – ${info.maxUsdt}`}
                className="w-full rounded-[14px] border border-[#e1e7e0] bg-[#f6f8f4] px-4 py-3 text-xs outline-none focus:border-[#6c9b44] focus:shadow-[0_0_0_3px_#c7f36b35]"
              />
              <p className="mt-1.5 text-[10px] text-muted">{t('wallet.amountHint', { fee: info.serviceFeeUsdt })}</p>
            </div>
            {error && <p role="alert" className="text-[11px] text-[#b45b45]">{error}</p>}
            <button
              disabled={busy}
              className="flex w-full items-center justify-center rounded-xl bg-mint py-3.5 text-xs font-bold text-[#20321a] hover:bg-mint-dark disabled:opacity-50"
            >
              {busy ? t('wallet.creating') : t('wallet.createBtn')}
            </button>
          </form>
        ) : deposit.status !== 'pending' ? (
          <div className="space-y-3 text-center">
            {deposit.status === 'credited' ? (
              <>
                <Use id="i-check" className="icon mx-auto h-10 w-10 text-[#5d7e3d]" />
                <p className="text-sm font-semibold">{t('wallet.creditedMsg', { vnd: deposit.creditedVnd ? vnd(deposit.creditedVnd) : '' })}</p>
              </>
            ) : (
              <>
                <Badge status={deposit.status} />
                {deposit.status === 'expired' && <p className="text-[11px] text-muted">{t('wallet.expiredMsg')}</p>}
              </>
            )}
            <button onClick={onClose} className="w-full rounded-xl border border-line py-3 text-xs font-semibold hover:bg-[#f3f6ed]">
              {t('wallet.closeBtn')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={t('wallet.qrAlt')} className="mx-auto h-45 w-45 rounded-lg" />
            <p className="text-center text-[10px] text-muted">{t('wallet.waitingConfirm')}</p>
            <div className="rounded-[14px] border border-[#cfe0bd] bg-tint p-4 text-[11px]">
              <div className="mb-2 flex justify-between"><span className="text-muted">{t('wallet.expiresIn')}</span><strong className="font-mono">{mm}:{ss}</strong></div>
              <div className="mb-2 flex justify-between"><span className="text-muted">{t('wallet.receivingNetwork')}</span><strong>{deposit.networkLabel}</strong></div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="shrink-0 text-muted">{t('wallet.exactAmount')}</span>
                <span className="flex items-center gap-1.5"><strong className="font-mono">{deposit.expectedAmount}</strong><CopyButton value={deposit.expectedAmount} /></span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="shrink-0 text-muted">{t('wallet.address')}</span>
                <span className="flex items-center gap-1.5 overflow-hidden">
                  <strong className="truncate font-mono text-[9px]">{deposit.address}</strong>
                  <CopyButton value={deposit.address} />
                </span>
              </div>
            </div>
            <p className="rounded-[10px] border border-[#f1e9d0] bg-[#fffaee] p-3 text-[9px] leading-[1.8] text-[#a18d5e]">
              {t('wallet.warningNote', { network: deposit.networkLabel })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
