'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function MarketingFooter() {
  const { t } = useI18n();
  const FOOTER = [
    {
      title: t('footer.exploreTitle'),
      links: [
        { label: t('footer.certificates'), href: '/#install' },
        { label: t('footer.appStore'), href: '/apps' },
        { label: t('footer.signIpa'), href: '/sign' },
      ],
    },
    {
      title: t('footer.supportTitle'),
      links: [
        { label: t('footer.installGuide'), href: '/#guide' },
        { label: t('footer.lookupOrder'), href: '/lookup' },
        { label: t('footer.checkCert'), href: '/check' },
      ],
    },
    {
      title: t('footer.connectTitle'),
      links: [
        { label: t('footer.telegram'), href: 'https://t.me/metusvn', external: true },
        { label: t('footer.faq'), href: '/#faq' },
        { label: t('footer.appleCert'), href: 'https://developer.apple.com/support/certificates/', external: true },
      ],
    },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1220px] px-6 py-9 sm:px-9">
        <div className="mb-9 flex flex-col items-start justify-between gap-8 sm:flex-row sm:gap-9">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-[25px] font-extrabold italic leading-none text-lime">m</span>
              <span>
                metus
                <small className="mt-0.5 block text-[7px] font-medium tracking-[2px] text-[#7e897f]">APP STORE</small>
              </span>
            </Link>
            <p className="mt-4 max-w-[230px] text-[10px] leading-[1.8] text-[#89947f]">
              {t('footer.tagline1')}
              <br />
              {t('footer.tagline2')}
            </p>
          </div>
          <div className="flex gap-10 sm:gap-[75px]">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <strong className="mb-[15px] block text-[10px]">{col.title}</strong>
                {col.links.map((l) =>
                  'external' in l && l.external ? (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="my-[13px] block text-[10px] text-[#89947f] hover:text-ink">
                      {l.label}
                    </a>
                  ) : (
                    <Link key={l.label} href={l.href} className="my-[13px] block text-[10px] text-[#89947f] hover:text-ink">
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between border-t border-line pt-[21px] text-[9px] text-[#96a08e]">
          <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
        </div>
      </div>
    </footer>
  );
}
