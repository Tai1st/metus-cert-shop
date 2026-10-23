/** Gọi API shop từ trình duyệt (cùng domain, cookie tự gửi). Trả về thông báo lỗi dạng chuỗi. */
export const post = <T = Record<string, unknown>>(path: string, body?: unknown) =>
  send<T>('POST', path, body);

/** Gửi nội dung file thô lên BE (có tiến trình). Dùng cho IPA lớn nên không dùng fetch. */
export function uploadRaw(
  path: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ ok: boolean; data: Record<string, unknown>; error: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/cert-shop${path}`);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* Cloudflare/nginx có thể trả trang chữ */
      }
      const ok = xhr.status >= 200 && xhr.status < 300;
      const m = data.message;
      const msg = Array.isArray(m) ? m[0] : (m as string | undefined);
      resolve({
        ok,
        data,
        error: ok ? '' : msg || (xhr.status === 413 ? 'File vượt quá giới hạn của máy chủ' : `Tải lên thất bại (${xhr.status})`),
      });
    };
    xhr.onerror = () => resolve({ ok: false, data: {}, error: 'Mất kết nối khi tải lên, vui lòng thử lại' });
    xhr.send(file);
  });
}

export const put =<T = Record<string, unknown>>(path: string, body?: unknown) =>
  send<T>('PUT', path, body);

async function send<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ ok: boolean; data: T; error: string }> {
  const res = await fetch(`/api/cert-shop${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  // Cloudflare/nginx có thể trả trang chữ thay vì JSON khi origin lỗi
  let data = {} as T & { message?: string | string[] };
  try {
    data = (text ? JSON.parse(text) : {}) as typeof data;
  } catch {
    return { ok: false, data, error: `Máy chủ lỗi (${res.status}), vui lòng thử lại sau` };
  }
  const msg = Array.isArray(data.message) ? data.message[0] : data.message;
  return { ok: res.ok, data, error: res.ok ? '' : msg || 'Có lỗi xảy ra' };
}
