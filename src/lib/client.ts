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
  const data = (text ? JSON.parse(text) : {}) as T & { message?: string | string[] };
  const msg = Array.isArray(data.message) ? data.message[0] : data.message;
  return { ok: res.ok, data, error: res.ok ? '' : msg || 'Có lỗi xảy ra' };
}
