'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Plan } from '@/lib/api';
import { Use } from './IconSprite';
import CheckoutModal, { type Enroll } from './CheckoutModal';
import UdidGuide from './UdidGuide';
import { useI18n } from '@/lib/i18n';

const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const KEY = 'metus_plan';
const remember = (id: string) => {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* trình duyệt chặn lưu trữ: bỏ qua */
  }
};
const recall = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export default function Storefront({
  plans,
  loggedIn,
  enroll,
  initialPlan,
}: {
  plans: Plan[];
  loggedIn: boolean;
  enroll: Enroll | null;
  initialPlan: string;
}) {
  const { t } = useI18n();
  const DEFAULT_FEATURES = [t('storefront.defFeat1'), t('storefront.defFeat2'), t('storefront.defFeat3')];
  const TOOLS = [
    { href: '/sign', icon: 'i-file', title: t('nav.signIpa'), sub: t('storefront.toolSignSub') },
    { href: '/apps', icon: 'i-grid', title: t('nav.appStore'), sub: t('storefront.toolAppsSub') },
    { href: '/check', icon: 'i-shield', title: t('workspace.navCheck'), sub: t('storefront.toolCheckSub') },
    { href: '/lookup', icon: 'i-search', title: t('workspace.navLookup'), sub: t('storefront.toolLookupSub') },
  ] as const;
  const STEPS = [
    { t: t('storefront.step1Title'), d: t('storefront.step1Desc') },
    { t: t('storefront.step2Title'), d: t('storefront.step2Desc') },
    { t: t('storefront.step3Title'), d: t('storefront.step3Desc') },
  ];
  const FEATURES = [
    { icon: 'i-phone', t: t('storefront.feat1Title'), d: t('storefront.feat1Desc') },
    { icon: 'i-file', t: t('storefront.feat2Title'), d: t('storefront.feat2Desc') },
    { icon: 'i-copy', t: t('storefront.feat3Title'), d: t('storefront.feat3Desc') },
    { icon: 'i-shield', t: t('storefront.feat4Title'), d: t('storefront.feat4Desc') },
  ];
  const FAQ = [
    { q: t('storefront.faq1Q'), a: t('storefront.faq1A') },
    { q: t('storefront.faq2Q'), a: t('storefront.faq2A') },
    { q: t('storefront.faq3Q'), a: t('storefront.faq3A') },
    { q: t('storefront.faq4Q'), a: t('storefront.faq4A') },
  ];

  const sorted = useMemo(() => [...plans].sort((a, b) => a.price - b.price), [plans]);
  // Gói đề xuất: gói cao thứ hai khi có từ 3 gói trở lên
  const recommended = sorted.length >= 3 ? sorted[sorted.length - 2].id : '';
  const [selected, setSelected] = useState('');
  const [guide, setGuide] = useState(false);

  // Mở lại cửa sổ thanh toán khi: quay về sau cài hồ sơ UDID (?e=), hoặc sau đăng nhập (?plan=)
  useEffect(() => {
    const want = initialPlan || (enroll ? recall() : '');
    if (want && sorted.some((p) => p.id === want)) setSelected(want);
  }, [initialPlan, enroll, sorted]);

  const plan = sorted.find((p) => p.id === selected);

  function buy(id: string) {
    remember(id);
    setSelected(id);
  }

  return (
    <div className="mx-auto max-w-[1220px] px-6 sm:px-9">
      {/* Hero */}
      <section className="grid items-center gap-8 pb-10 pt-8 lg:min-h-[560px] lg:grid-cols-[1.04fr_1fr] lg:gap-10 lg:pb-12 lg:pt-10">
        <div>
          <div className="flex items-center gap-2.5 text-[9px] font-bold tracking-[2px] text-[#7c8b7b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#86b74b]" /> {t('storefront.heroEyebrow')}
          </div>
          <h1 className="my-6 text-[40px] font-bold leading-[1.17] tracking-[-2px] sm:text-[58px] sm:tracking-[-3px]">
            {t('storefront.heroLine1')}
            <br />
            <em className="not-italic text-[#82a650]">{t('storefront.heroLine2')}</em>
            <br />
            {t('storefront.heroLine3')}
          </h1>
          <p className="max-w-[400px] text-[13px] leading-[1.95] text-muted">
            {t('storefront.heroSub1')}
            <br />
            {t('storefront.heroSub2')}
          </p>
          <div className="my-[26px] flex flex-wrap gap-3">
            <a href="#install" className="flex items-center gap-4 rounded-[11px] bg-deep px-[21px] py-[15px] text-xs font-semibold text-white hover:bg-deep-dark">
              {t('storefront.choosePlanCta')} <Use id="i-arrow" className="icon h-[17px] w-[17px]" />
            </a>
            <Link href="/apps" className="flex items-center gap-4 rounded-[11px] border border-line bg-white px-[21px] py-[15px] text-xs font-semibold hover:bg-[#f3f5ee]">
              {t('nav.appStore')} <Use id="i-grid" className="icon h-[17px] w-[17px]" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] text-[#7d887e]">
            <span className="flex items-center gap-1.5">
              <Use id="i-shield" className="icon h-[13px] w-[13px] text-[#607e4a]" /> {t('storefront.badgePerDevice')}
            </span>
            <span className="flex items-center gap-1.5">
              <Use id="i-phone" className="icon h-[13px] w-[13px] text-[#607e4a]" /> {t('storefront.badgeDirectInstall')}
            </span>
          </div>
        </div>

        {/* Minh họa điện thoại */}
        <div className="relative hidden h-[440px] overflow-hidden rounded-[30px] border border-[#e1e7db] bg-[#eaf0e3] sm:block lg:h-[470px]">
          <div className="absolute left-1/2 top-9 h-[430px] w-[430px] -translate-x-1/2 rounded-full border border-[#9cae8f30] shadow-[0_0_0_45px_#9cae8f10,0_0_0_90px_#9cae8f0b]" />
          <div className="absolute left-6 top-6 text-[9px] tracking-[1.4px] text-[#798b72]">YOUR iPHONE. YOUR POSSIBILITIES.</div>
          <div className="absolute left-1/2 top-[60px] w-[214px] -translate-x-1/2 -rotate-[9deg] overflow-hidden rounded-[35px] border-[5px] border-[#344e3f] bg-[#10281f] text-white shadow-[16px_23px_30px_#1c3a2929,inset_0_0_0_1px_#81917d]">
            <div className="mx-auto mt-2 h-[18px] w-[66px] rounded-full bg-[#071710]" />
            <div className="relative -top-3.5 mx-[15px] flex justify-between text-[9px]">
              <span>9:41</span>
              <span>▮▮▮ ▰</span>
            </div>
            <div className="relative px-[18px] pb-6">
              <div className="mx-auto mb-4 grid h-[63px] w-[63px] place-items-center rounded-[18px] bg-gradient-to-br from-[#dcf8a0] to-[#a7d75c] text-[#183922] shadow-[0_8px_25px_#0003]">
                <Use id="i-globe" className="icon h-[43px] w-[43px]" />
              </div>
              <h3 className="mb-1.5 text-center text-lg tracking-tight">Metus Browser</h3>
              <p className="text-center text-[8px] leading-[1.7] text-[#c0c9bb]">{t('storefront.phoneTagline')}</p>
              <div className="my-[19px] rounded-[9px] border border-[#ffffff19] bg-[#ffffff13] p-[11px] text-[8px] text-[#bac5b6]">
                ⌕ &nbsp; {t('storefront.phoneSearchPlaceholder')}
              </div>
              <div className="flex gap-2">
                {(['i-grid', 'i-file', 'i-shield'] as const).map((ic) => (
                  <div key={ic} className="grid h-[46px] flex-1 place-items-center rounded-[9px] bg-[#ffffff0b] text-[#b3cb92]">
                    <Use id={ic} className="icon h-[17px] w-[17px]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 h-1 w-[65px] -translate-x-1/2 rounded-full bg-white" />
          </div>
          <div className="absolute left-5 top-[172px] -rotate-3 rounded-[14px] border border-white bg-white/95 p-3.5 shadow-[0_10px_40px_#354c2912] backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-[35px] w-[35px] place-items-center rounded-[10px] bg-[#e9f4db] text-[#648e36]">
                <Use id="i-shield" className="icon h-[18px] w-[18px]" />
              </span>
              <div>
                <strong className="block text-[11px]">{t('nav.certificates')}</strong>
                <small className="text-[8px] text-[#85917f]">{t('storefront.cardRegisterDevice')}</small>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[73px] right-4 rotate-[4deg] rounded-[14px] border border-white bg-white/95 p-3.5 shadow-[0_10px_40px_#354c2912] backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-[35px] w-[35px] place-items-center rounded-[10px] bg-[#e9f4db] text-[#648e36]">
                <Use id="i-zap" className="icon h-[18px] w-[18px]" />
              </span>
              <div>
                <strong className="block text-[11px]">{t('orderDetail.readyTitle')}</strong>
                <small className="text-[8px] text-[#85917f]">{t('storefront.cardDirectInstall')}</small>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[19px] left-[22px] text-[8px] tracking-wide text-[#86957c]">METUS BROWSER &nbsp; / &nbsp; iOS EXPERIENCE</div>
        </div>
      </section>

      {/* Lối tắt công cụ */}
      <div className="mb-14 grid grid-cols-2 overflow-hidden rounded-[15px] border border-line bg-white sm:grid-cols-4">
        {TOOLS.map((tool, i) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`flex items-center gap-3 border-line p-[18px] hover:bg-[#f0f5e9] sm:p-[21px] ${
              i < 2 ? 'border-b sm:border-b-0' : ''
            } ${i % 2 === 0 ? 'border-r' : ''} sm:border-r sm:[&:last-child]:border-r-0`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#f3f5ee] text-[#5b7150]">
              <Use id={tool.icon} className="icon h-[18px] w-[18px]" />
            </span>
            <span>
              <strong className="block text-xs">{tool.title}</strong>
              <small className="text-[9px] text-[#8a9388]">{tool.sub}</small>
            </span>
            <span className="ml-auto hidden text-[#9aa593] sm:inline">↗</span>
          </Link>
        ))}
      </div>

      {/* Gói chứng chỉ */}
      <section id="install" className="scroll-mt-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-[9px] font-bold tracking-[2px] text-[#7c8b7b]">{t('storefront.pricingEyebrow')}</div>
            <h2 className="mt-3 text-[28px] leading-[1.3] tracking-[-1.2px] sm:text-[32px]">
              {t('storefront.pricingTitle1')}
              <br />
              {t('storefront.pricingTitle2')}
            </h2>
            <p className="mt-2.5 text-[11px] leading-[1.8] text-muted">{t('storefront.pricingSub')}</p>
          </div>
          <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-[15px] py-[11px] text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#86b74b]" /> {t('storefront.pricingBadge')}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((p, i) => {
            const featured = p.id === recommended;
            const feats = p.features?.length ? p.features : DEFAULT_FEATURES;
            return (
              <article
                key={p.id}
                className={`relative flex flex-col rounded-[18px] border p-[21px] ${
                  featured ? 'border-deep bg-deep text-white shadow-[0_10px_35px_#16302516]' : 'border-line bg-white'
                }`}
              >
                {featured && (
                  <span className="absolute -top-[13px] left-[21px] rounded-[7px] bg-lime px-3 py-[7px] text-[8px] font-bold tracking-wide text-[#334a21]">
                    {t('storefront.recommended')}
                  </span>
                )}
                <div
                  className={`mb-[22px] grid h-[38px] w-[38px] place-items-center rounded-[11px] ${
                    featured ? 'bg-white/10 text-lime' : 'bg-[#f1f5e9] text-[#778962]'
                  }`}
                >
                  <Use id={i === sorted.length - 1 ? 'i-zap' : 'i-shield'} className="icon h-[18px] w-[18px]" />
                </div>
                <div className={`mb-[7px] text-[10px] ${featured ? 'text-[#aab8a2]' : 'text-[#8b9685]'}`}>{p.receiveTime || t('storefront.receiveNow')}</div>
                <h3 className="mb-[21px] text-[17px] tracking-[-0.6px]">{p.title}</h3>
                <div className="whitespace-nowrap text-[29px] font-bold tracking-[-1.5px]">
                  {vnd(p.price).replace('đ', '')}
                  <sup className="ml-0.5 align-top text-sm font-medium">đ</sup>
                </div>
                <div className={`mb-[22px] mt-[7px] text-[9px] ${featured ? 'text-[#aab8a2]' : 'text-[#98a090]'}`}>
                  {t('storefront.perDevice')} · {p.validity || t('storefront.twelveMonths')}
                </div>
                <button
                  type="button"
                  onClick={() => buy(p.id)}
                  className={`w-full rounded-[9px] border py-[13px] text-[11px] font-semibold ${
                    featured ? 'border-lime bg-lime text-[#2b461a] hover:bg-lime-dark' : 'border-[#e2e8d9] bg-[#f0f4e8] hover:bg-[#e6ecdb]'
                  }`}
                >
                  {t('storefront.choosePlan')}
                </button>
                <div className={`mt-[22px] flex items-center gap-[7px] border-t pt-[19px] text-[11px] font-semibold ${featured ? 'border-white/[0.12]' : 'border-line'}`}>
                  <Use id="i-shield" className={`icon h-4 w-4 ${featured ? 'text-lime' : 'text-[#7b9d4e]'}`} />
                  {p.warranty || t('storefront.hasWarranty')}
                </div>
                <ul className={`mt-3 space-y-2.5 text-[10px] leading-[1.8] ${featured ? 'text-[#b7c3af]' : 'text-[#84917d]'}`}>
                  {feats.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className={featured ? 'text-lime' : 'text-[#7d9a51]'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
          {sorted.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-[#cfd8cc] bg-white p-8 text-center text-xs text-muted">{t('storefront.plansLoadError')}</p>
          )}
        </div>
        <p className="my-[17px] text-center text-[9px] text-[#8b9584] sm:mb-[66px]">{t('storefront.pricingFootnote')}</p>
      </section>

      {/* Quy trình */}
      <section id="guide" className="mb-[70px] scroll-mt-6 rounded-[23px] bg-[#edf1e7] p-6 sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr] lg:items-center lg:gap-10">
          <div>
            <div className="text-[9px] font-bold tracking-[2px] text-[#7c8b7b]">{t('storefront.stepsEyebrow')}</div>
            <h2 className="my-3 text-[25px] leading-[1.3] tracking-[-1px] sm:text-[27px]">
              {t('storefront.stepsTitle1')}
              <br />
              {t('storefront.stepsTitle2')}
            </h2>
            <p className="text-[11px] leading-[1.8] text-[#849078]">{t('storefront.stepsSub')}</p>
            <button
              type="button"
              onClick={() => setGuide(true)}
              className="mt-[18px] inline-flex items-center gap-3 text-[11px] font-semibold"
            >
              {t('storefront.viewUdidGuide')} <Use id="i-arrow" className="icon h-[15px] w-[15px]" />
            </button>
          </div>
          <div className="grid gap-[22px] sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.t}>
                <span className="mb-[18px] grid h-[30px] w-[30px] place-items-center rounded-full border border-[#dbe4d0] bg-white text-[10px] text-[#75954a]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 text-xs">{s.t}</h3>
                <p className="text-[10px] leading-[1.6] text-[#849078]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tính năng */}
      <section className="mb-[70px] grid gap-[22px] lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[300px] overflow-hidden rounded-[23px] bg-deep p-7 text-white sm:p-9">
          <div className="pointer-events-none absolute -bottom-[70px] -right-[115px] h-[260px] w-[260px] rounded-full border border-[#aacd7b20] shadow-[0_0_0_30px_#aacd7b09,0_0_0_60px_#aacd7b06]" />
          <div className="relative text-[9px] font-bold tracking-[2px] text-[#a7bb9e]">{t('storefront.featuresEyebrow')}</div>
          <h2 className="relative my-3 max-w-[310px] text-[26px] leading-[1.35] tracking-[-1px] sm:text-[30px]">
            {t('storefront.featuresTitle1')}
            <br />
            {t('storefront.featuresTitle2')}
          </h2>
          <p className="relative max-w-[280px] text-[11px] leading-[1.8] text-[#a8ba9f]">{t('storefront.featuresDesc')}</p>
          <Link href="/apps" className="relative mt-6 inline-flex items-center gap-3 rounded-[11px] border border-white/20 px-4 py-3 text-[10px] font-semibold">
            {t('dashboard.exploreApps')} <Use id="i-arrow" className="icon h-[15px] w-[15px]" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-[17px] border border-line bg-white p-[22px]">
              <Use id={f.icon} className="icon mb-[18px] h-[22px] w-[22px] text-[#7d995c]" />
              <h3 className="mb-2 text-xs">{f.t}</h3>
              <p className="text-[10px] leading-[1.8] text-[#8b9683]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-[70px] grid scroll-mt-6 gap-10 lg:grid-cols-[1fr_1.45fr] lg:gap-20">
        <div>
          <div className="text-[9px] font-bold tracking-[2px] text-[#7c8b7b]">{t('storefront.faqEyebrow')}</div>
          <h2 className="my-3.5 text-[26px] leading-[1.3] tracking-[-1px] sm:text-[30px]">
            {t('storefront.faqTitle1')}
            <br />
            {t('storefront.faqTitle2')}
          </h2>
          <p className="text-[11px] leading-[1.9] text-[#84907a]">{t('storefront.faqDesc')}</p>
          <a href="https://t.me/metusvn" target="_blank" rel="noreferrer" className="mt-[18px] inline-flex items-center gap-3 text-[11px] font-semibold">
            {t('storefront.contactTelegram')} <Use id="i-arrow" className="icon h-[15px] w-[15px]" />
          </a>
        </div>
        <div>
          {FAQ.map((f) => (
            <details key={f.q} className="group border-b border-line py-5 first:pt-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-xs font-medium">
                {f.q}
                <span className="text-lg font-normal text-[#99a18f] group-open:hidden">+</span>
                <span className="hidden text-lg font-normal text-[#99a18f] group-open:inline">−</span>
              </summary>
              <p className="mr-6 mt-3 text-[11px] leading-[1.9] text-[#84907a]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA cuối trang */}
      <section className="mb-[65px] flex flex-col items-start justify-between gap-6 rounded-[18px] border border-[#dce7cb] bg-[#eaf1df] p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <h3 className="mb-2 text-xl tracking-[-0.7px]">{t('storefront.ctaTitle')}</h3>
          <p className="text-[11px] text-[#8a967d]">{t('storefront.ctaDesc')}</p>
        </div>
        <a href="#install" className="flex shrink-0 items-center gap-4 rounded-[11px] bg-deep px-[21px] py-[15px] text-xs font-semibold text-white hover:bg-deep-dark">
          {t('storefront.choosePlanCta')} <Use id="i-arrow" className="icon h-[17px] w-[17px]" />
        </a>
      </section>

      {plan && (
        <CheckoutModal plan={plan} loggedIn={loggedIn} enroll={enroll} onGuide={() => setGuide(true)} onClose={() => setSelected('')} />
      )}
      {guide && <UdidGuide onClose={() => setGuide(false)} />}
    </div>
  );
}
