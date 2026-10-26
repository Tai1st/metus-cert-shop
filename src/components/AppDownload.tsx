"use client";

import { fmtSize } from "@/lib/format";
import type { AppInfo } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import InstallButton from "./InstallButton";

export default function AppDownload({ app }: { app: AppInfo }) {
  const { t } = useI18n();

  // Dùng bản dịch hiện có để xác định ngôn ngữ.
  const isVi = t("orderDetail.version").toLowerCase().includes("phiên bản");

  if (!app.available || !app.canDownload) return null;

  const guideImage = `/images/developer-mode-${isVi ? "vi" : "en"}.png`;
  const guideTitle = isVi
    ? "Hướng dẫn bật Chế độ nhà phát triển"
    : "How to enable Developer Mode";

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

        <a
          href={guideImage}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl border border-line"
          aria-label={
            isVi ? "Mở ảnh hướng dẫn kích thước đầy đủ" : "Open full-size guide"
          }
        >
          <img
            src={guideImage}
            alt={guideTitle}
            width={1672}
            height={941}
            loading="lazy"
            className="block h-auto w-full"
          />
        </a>

        <p className="text-[10px] text-muted">
          {isVi
            ? "Nhấn vào ảnh để xem hướng dẫn đầy đủ."
            : "Tap the image to view the full-size guide."}
        </p>
      </div>
    </div>
  );
}
