/** Gọi API shop từ trình duyệt (cùng domain, cookie tự gửi). Trả về thông báo lỗi dạng chuỗi. */
export const post = <T = Record<string, unknown>>(path: string, body?: unknown) =>
  send<T>('POST', path, body);

export const put = <T = Record<string, unknown>>(path: string, body?: unknown) =>
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
