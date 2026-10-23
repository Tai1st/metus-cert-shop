import { fmtSize, type AppInfo } from '@/lib/api';

/** Thẻ tải Metus Browser (IPA chưa ký) cho khách đã có chứng chỉ. */
export default function AppDownload({ app }: { app: AppInfo }) {
  if (!app.available || !app.canDownload) return null;
  return (
    <div className="space-y-4 rounded-xl border border-line bg-white p-4 text-sm">
      <h2 className="text-[11px] font-bold tracking-[2px] text-accent">BƯỚC CUỐI · CÀI ỨNG DỤNG</h2>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{app.name}</div>
          <div className="text-xs text-muted">
            Phiên bản {app.version} · {fmtSize(app.size)}
            {app.minOs && ` · iOS ${app.minOs} trở lên`}
          </div>
        </div>
        <a
          href="/api/cert-shop/app/download"
          className="shrink-0 rounded-[10px] bg-mint px-4 py-2.5 text-xs font-bold text-[#20321a] hover:bg-mint-dark"
        >
          Tải ứng dụng (.ipa)
        </a>
      </div>
      <ol className="list-decimal space-y-1.5 border-t border-line pl-5 pt-3 text-xs leading-[1.8] text-muted">
        <li>
          Tải <b>chứng chỉ (.zip)</b> ở trên và <b>ứng dụng (.ipa)</b> ở đây về cùng một thiết bị.
        </li>
        <li>
          Dùng một công cụ ký IPA trên iPhone hoặc máy tính, chọn file <b>.p12</b> và <b>.mobileprovision</b> trong gói chứng chỉ, nhập
          mật khẩu <b>.p12</b> hiển thị ở trên.
        </li>
        <li>Ký xong thì cài ứng dụng đã ký lên iPhone. Lần đầu có thể phải vào Cài đặt để tin cậy chứng chỉ.</li>
      </ol>
      <p className="text-[10px] text-muted">Ứng dụng chỉ chạy trên đúng thiết bị có UDID đã đăng ký trong đơn này.</p>
    </div>
  );
}
