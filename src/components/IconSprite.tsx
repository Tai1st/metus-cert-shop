/** Bộ icon dùng chung qua <use href="#i-...">, đặt một lần ở layout gốc cho cả trang chủ lẫn khu Workspace. */
export default function IconSprite() {
  return (
    <svg style={{ display: 'none' }} aria-hidden="true">
      <symbol id="i-arrow" viewBox="0 0 24 24">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </symbol>
      <symbol id="i-shield" viewBox="0 0 24 24">
        <path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </symbol>
      <symbol id="i-grid" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </symbol>
      <symbol id="i-file" viewBox="0 0 24 24">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Zm0 0v6h6M8 14h8m-8 4h5" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </symbol>
      <symbol id="i-globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4.5" ry="9" />
        <path d="M3 9h18M3 15h18" />
      </symbol>
      <symbol id="i-phone" viewBox="0 0 24 24">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M10 5h4m-3 14h2" />
      </symbol>
      <symbol id="i-zap" viewBox="0 0 24 24">
        <path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z" />
      </symbol>
      <symbol id="i-copy" viewBox="0 0 24 24">
        <rect x="8" y="8" width="13" height="13" rx="3" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </symbol>
      <symbol id="i-dashboard" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </symbol>
      <symbol id="i-orders" viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6m-6 4h6m-6 4h4" />
      </symbol>
      <symbol id="i-sign" viewBox="0 0 24 24">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Zm0 0v6h6m-12 8 3-3 2 2 4-4" />
      </symbol>
      <symbol id="i-apps" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <path d="M17.5 14v7M14 17.5h7" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </symbol>
      <symbol id="i-lookup" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </symbol>
      <symbol id="i-upload" viewBox="0 0 24 24">
        <path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
      </symbol>
      <symbol id="i-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </symbol>
      <symbol id="i-wallet" viewBox="0 0 24 24">
        <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        <path d="M16 12h3v3h-3a1.5 1.5 0 0 1 0-3Z" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </symbol>
    </svg>
  );
}

/** <svg><Use id="i-arrow" /></svg> — gọn hơn viết use href trực tiếp. */
export function Use({ id, className = '' }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`icon h-[22px] w-[22px] ${className}`}>
      <use href={`#${id}`} />
    </svg>
  );
}
