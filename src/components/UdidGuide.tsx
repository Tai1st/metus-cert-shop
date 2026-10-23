'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useI18n } from '@/lib/i18n';

/* ---------- Hình minh họa các bước (vẽ bằng HTML, đúng tên miền và hồ sơ của shop) ---------- */

const ring = 'ring-2 ring-red-500 ring-offset-1';

function Panel({ dim, children }: { dim?: boolean; children: ReactNode }) {
  return (
    <div className="relative min-h-[120px] min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-white p-1.5 text-[6.5px] leading-tight sm:min-h-[170px] sm:p-2.5 sm:text-[9px]">
      {children}
      {dim && <div className="absolute inset-0 bg-black/45" />}
    </div>
  );
}

/** Hộp thoại kiểu iOS, đặt đè lên lớp tối của Panel */
function IosDialog({ title, body, actions }: { title?: string; body: string; actions: { label: string; hit?: boolean }[] }) {
  return (
    <div className="absolute inset-x-1 top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-lg bg-[#2c2c2e] text-center text-white sm:inset-x-2 sm:rounded-xl">
      <div className="p-1.5 sm:p-2.5">
        {title && <div className="mb-1 text-[7px] font-semibold sm:text-[10px]">{title}</div>}
        <div className="text-[6.5px] leading-snug text-[#e5e5ea] sm:text-[9px]">{body}</div>
      </div>
      <div className="flex border-t border-[#48484a]">
        {actions.map((a) => (
          <div
            key={a.label}
            className={`flex-1 overflow-hidden py-1 text-[6.5px] text-[#4a9bff] sm:py-1.5 sm:text-[9px] ${a.hit ? 'font-semibold' : ''}`}
          >
            <span className={`whitespace-nowrap rounded px-0.5 ${a.hit ? ring : ''}`}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FakeOrderCard() {
  const { t } = useI18n();
  return (
    <>
      <div className="mb-1 font-semibold">{t('udidGuide.figUdidLabel')}</div>
      <div className="mb-1.5 rounded-md border border-[#dfe5de] p-1 text-muted sm:mb-2 sm:p-1.5">{t('udidGuide.figUdidPlaceholder')}</div>
      <div className="flex gap-1">
        <div className={`flex-1 rounded-md bg-ink p-1 text-center text-white sm:p-1.5 ${ring}`}>{t('udidGuide.figGetUdid')}</div>
        <div className="flex-1 rounded-md border border-[#dfe6d7] bg-[#f5f8ef] p-1 text-center text-[#5d7e3d] sm:p-1.5">{t('nav.guide')}</div>
      </div>
      <div className="mt-2 mb-1 font-semibold sm:mt-3">{t('udidGuide.figPaymentMethod')}</div>
      <div className="rounded-md border border-[#dfe5de] p-1 text-muted sm:p-1.5">{t('udidGuide.figBankTransfer')}</div>
    </>
  );
}

function FigureDownload() {
  const { t } = useI18n();
  return (
    <div className="mt-4 flex gap-1.5 sm:gap-2">
      <Panel>
        <FakeOrderCard />
      </Panel>
      <Panel dim>
        <FakeOrderCard />
        <IosDialog
          body={t('udidGuide.figAllowDialogBody')}
          actions={[{ label: t('udidGuide.figSkip') }, { label: t('udidGuide.figAllow'), hit: true }]}
        />
      </Panel>
      <Panel dim>
        <FakeOrderCard />
        <IosDialog title={t('udidGuide.figDownloadedTitle')} body={t('udidGuide.figDownloadedBody')} actions={[{ label: t('common.close'), hit: true }]} />
      </Panel>
    </div>
  );
}

function FigureInstall() {
  const { t } = useI18n();
  return (
    <div className="mt-4 flex gap-1.5 sm:gap-2">
      <Panel>
        <div className="mb-1.5 text-[8px] font-bold sm:mb-2 sm:text-sm">{t('udidGuide.figSettingsTitle')}</div>
        <div className="space-y-1 sm:space-y-1.5">
          <div className="rounded-lg bg-[#f2f2f7] p-1 text-muted sm:p-2">{t('udidGuide.figSearch')}</div>
          <div className={`flex items-center justify-between rounded-lg bg-[#f2f2f7] p-1 sm:p-2 ${ring}`}>
            <span className="font-semibold text-ink">{t('udidGuide.figDownloadedTitle')}</span>
            <span className="text-muted">›</span>
          </div>
          <div className="rounded-lg bg-[#f2f2f7] p-1 sm:p-2">{t('udidGuide.figGeneral')}</div>
          <div className="rounded-lg bg-[#f2f2f7] p-1 sm:p-2">{t('udidGuide.figDisplayBrightness')}</div>
        </div>
      </Panel>
      <Panel>
        <div className="mb-1.5 flex items-center justify-between text-[6.5px] text-[#007aff] sm:mb-2 sm:text-[10px]">
          <span>{t('udidGuide.figCancel')}</span>
          <span className={`rounded px-1 font-semibold ${ring}`}>{t('udidGuide.figSettingsTitle')}</span>
        </div>
        <div className="mb-1 text-center sm:mb-1.5">
          <div className="text-[7.5px] font-bold sm:text-[11px]">{t('udidGuide.figGetUdidProfile')}</div>
          <div className="text-muted">Metus</div>
        </div>
        <div className="space-y-1 rounded-lg bg-[#f2f2f7] p-1 sm:p-2">
          <div className="flex justify-between"><span className="text-muted">{t('udidGuide.figSignedBy')}</span><span className="text-red-600">{t('udidGuide.figUnsigned')}</span></div>
          <div className="flex justify-between"><span className="text-muted">{t('udidGuide.figDescription')}</span><span className="max-w-[60%] text-right">{t('udidGuide.figDescValue')}</span></div>
          <div className="flex justify-between"><span className="text-muted">{t('udidGuide.figContains')}</span><span>{t('udidGuide.figProfileService')}</span></div>
        </div>
      </Panel>
    </div>
  );
}

function FigureBack() {
  const { t } = useI18n();
  return (
    <div className="mt-4 flex gap-1.5 sm:gap-2">
      <Panel>
        <div className="mb-1.5 rounded-full bg-[#f2f2f7] px-2 py-1 text-center text-[#3c3c43] sm:mb-2">🔒 appstore.metus.vn</div>
        <div className="mb-1 font-semibold">{t('udidGuide.figUdidLabel')}</div>
        <div className="mb-1 break-all rounded-md border border-[#dfe5de] bg-[#f7f9f5] p-1 font-mono sm:p-1.5">00008120-000A11223344401E</div>
        <div className="mb-1.5 text-muted sm:mb-2">iPhone15,3 · iOS 22A100</div>
        <div className="rounded-md bg-mint p-1.5 text-center font-bold text-[#20321a] sm:p-2">{t('udidGuide.figContinuePayment')}</div>
      </Panel>
      <div className="flex flex-1 items-center rounded-xl border border-dashed border-[#cfd8cc] bg-[#f7f9f5] p-1.5 text-[6.5px] leading-[1.6] text-muted sm:p-3 sm:text-[10px] sm:leading-[1.7]">
        {t('udidGuide.figAutoFilled')}
      </div>
    </div>
  );
}


type Step = { t: string; d: ReactNode; fig?: ReactNode };

function FigureImg({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line">
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh minh họa lấy trực tiếp từ CDN chính thức của 3u.com, không tải về lưu lại */}
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
    </div>
  );
}

export default function UdidGuide({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<'iphone' | '3u'>('iphone');

  const IPHONE: Step[] = [
    {
      t: t('udidGuide.iphoneStep1Title'),
      d: t('udidGuide.iphoneStep1Desc'),
      fig: <FigureDownload />,
    },
    {
      t: t('udidGuide.iphoneStep2Title'),
      d: (
        <>
          {t('udidGuide.iphoneStep2Desc')}
          <span className="mt-3 block rounded-[10px] border border-[#e1e8d8] bg-[#f4f7f0] p-3 text-[11px] leading-relaxed text-[#556649]">
            {t('udidGuide.iphoneStep2Path')}
          </span>
        </>
      ),
      fig: <FigureInstall />,
    },
    {
      t: t('udidGuide.iphoneStep3Title'),
      d: t('udidGuide.iphoneStep3Desc'),
      fig: <FigureBack />,
    },
  ];

  const THREEU: Step[] = [
    {
      t: t('udidGuide.threeuStep1Title'),
      d: t('udidGuide.threeuStep1Desc'),
      fig: <FigureImg src="https://dl-image.3u.com/upload/20160930/1475228216405008115.jpg" alt={t('udidGuide.threeuStep1Title')} />,
    },
    {
      t: t('udidGuide.threeuStep2Title'),
      d: t('udidGuide.threeuStep2Desc'),
      fig: <FigureImg src="https://dl-image.3u.com/upload/20160930/1475228244734042723.jpg" alt={t('udidGuide.threeuStep2Title')} />,
    },
    {
      t: t('udidGuide.threeuStep3Title'),
      d: t('udidGuide.threeuStep3Desc'),
      fig: <FigureImg src="https://dl-image.3u.com/upload/20160930/1475228269062047404.jpg" alt={t('udidGuide.threeuStep3Title')} />,
    },
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const steps = tab === 'iphone' ? IPHONE : THREEU;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c202675] p-5 backdrop-blur-[6px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="udid-guide-title"
        className="relative max-h-[90vh] w-[660px] max-w-full overflow-y-auto rounded-[22px] bg-white p-7 shadow-[0_30px_90px_#0003]"
      >
        <button
          onClick={onClose}
          aria-label={t('udidGuide.closeGuide')}
          className="absolute right-[18px] top-[15px] h-7 w-7 rounded-full bg-[#f2f5ef] text-[#64715e]"
        >
          ×
        </button>
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[2px]">
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#87b844]" /> {t('udidGuide.eyebrow')}
        </div>
        <h2 id="udid-guide-title" className="mb-2 mt-2 text-lg font-bold tracking-tight">
          {t('udidGuide.title')}
        </h2>
        <p className="text-xs leading-relaxed text-muted">{t('udidGuide.subtitle')}</p>

        <div className="my-5 flex rounded-[10px] bg-[#f0f4ec] p-1" role="tablist" aria-label={t('udidGuide.tabsLabel')}>
          {(
            [
              ['iphone', t('udidGuide.tabIphone')],
              ['3u', t('udidGuide.tab3u')],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-[7px] p-2.5 text-xs ${
                tab === k ? 'bg-white font-bold text-ink shadow-[0_2px_7px_#21310f0c]' : 'text-[#7b8874]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {steps.map((s, i) => (
            <div key={s.t} className="border-b border-line py-5 last:border-0 last:pb-0">
              <h3 className="flex items-center gap-2.5 text-sm font-bold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#edf4e4] text-xs text-[#5d7d3b]">
                  {i + 1}
                </span>
                {s.t}
              </h3>
              <p className="mt-2 text-xs leading-[1.9] text-muted">{s.d}</p>
              {s.fig}
            </div>
          ))}
        </div>

        <div className="sticky -bottom-7 mt-3 border-t border-line bg-white pt-4">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-3 rounded-[10px] bg-mint p-[15px] text-xs font-bold text-[#20321a] transition hover:bg-mint-dark"
          >
            {t('udidGuide.gotIt')} <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
