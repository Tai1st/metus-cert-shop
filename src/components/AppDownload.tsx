"use client";

import { useEffect, useRef, useState } from "react";
import { fmtSize } from "@/lib/format";
import type { AppInfo } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import InstallButton from "./InstallButton";

export default function AppDownload({ app }: { app: AppInfo }) {
  const { t } = useI18n();
  const [showGuide, setShowGuide] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Nếu useI18n có locale, nên dùng locale === 'vi' tại đây.
  const isVi = t("orderDetail.version").toLowerCase().includes("phiên bản");

  const canDownload = app.available && app.canDownload;

  const guideImage = `/images/developer-mode-${isVi ? "vi" : "en"}.png`;

  const guideTitle = isVi
    ? "Hướng dẫn bật Chế độ nhà phát triển"
    : "How to enable Developer Mode";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showGuide && canDownload) {
      if (!dialog.open) dialog.showModal();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
        if (dialog.open) dialog.close();
      };
    }

    if (dialog.open) dialog.close();
  }, [showGuide, canDownload]);

  useEffect(() => {
    if (!canDownload) setShowGuide(false);
  }, [canDownload]);

  if (!canDownload) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-white p-[23px] text-sm shadow-[0_5px_24px_#21361703]">
      <h2 className="text-[11px] font-bold tracking-[2px] text-accent">
        {t("orderDetail.finalStep")}
      </h2>

      <div>
        <div className="font-semibold">{app.name}</div>

        <div className="text-xs text-muted">
          {t("orderDetail.version")} {app.version} · {fmtSize(app.size)}
          {app.minOs && ` · iOS ${app.minOs}+`}
        </div>
      </div>

      <InstallButton endpoint="/app/install" />

      <p className="text-[10px] text-muted">{t("orderDetail.udidNote")}</p>

      <div className="space-y-3 border-t border-line pt-4">
        <h3 className="text-xs font-semibold">{guideTitle}</h3>

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          aria-haspopup="dialog"
          aria-label={isVi ? "Phóng to hướng dẫn" : "Enlarge guide"}
          className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-line transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <img
            src={guideImage}
            alt={guideTitle}
            width={1672}
            height={941}
            loading="lazy"
            className="block h-auto w-full"
          />
        </button>

        <p className="text-[10px] text-muted">
          {isVi
            ? "Nhấn vào ảnh để phóng to hướng dẫn."
            : "Tap the image to enlarge the guide."}
        </p>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={guideTitle}
        onCancel={(event) => {
          event.preventDefault();
          setShowGuide(false);
        }}
        onClose={() => setShowGuide(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setShowGuide(false);
          }
        }}
        className="fixed inset-0 m-auto max-h-[95dvh] w-[96vw] max-w-7xl overflow-hidden rounded-2xl border-0 bg-white p-0 text-sm shadow-2xl backdrop:bg-black/80"
      >
        <div className="flex max-h-[95dvh] flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-4 py-3">
            <h3 className="text-sm font-semibold">{guideTitle}</h3>

            <button
              type="button"
              autoFocus
              onClick={() => setShowGuide(false)}
              aria-label={isVi ? "Đóng hướng dẫn" : "Close guide"}
              className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium transition hover:bg-gray-200"
            >
              {isVi ? "Đóng" : "Close"} ✕
            </button>
          </div>

          <div className="min-h-0 overflow-auto overscroll-contain p-3">
            <img
              src={guideImage}
              alt={guideTitle}
              width={1672}
              height={941}
              className="block h-auto w-full min-w-[1000px] rounded-lg"
            />
          </div>

          <p className="shrink-0 border-t border-line px-4 py-3 text-[11px] text-muted">
            {isVi
              ? "Trên điện thoại, vuốt ngang ảnh để xem đầy đủ các bước."
              : "On mobile, swipe horizontally to view all steps."}
          </p>
        </div>
      </dialog>
    </div>
  );
}
