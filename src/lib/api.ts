import { cookies } from 'next/headers';

const BE_URL = (process.env.BE_URL || 'http://127.0.0.1:4100').replace(/\/$/, '');

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

/** Gọi BE từ server component, chuyển tiếp cookie phiên của khách. */
export async function be<T = unknown>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BE_URL}/api/cert-shop${path}`, {
      ...init,
      headers: { cookie: (await cookies()).toString(), ...init.headers },
      cache: 'no-store',
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, data: (text ? JSON.parse(text) : null) as T };
  } catch {
    return { ok: false, status: 0, data: null as T };
  }
}

export interface Me {
  id: string;
  username: string;
  fullName: string;
  isAdmin: boolean;
}

export async function getMe(): Promise<Me | null> {
  const r = await be<Me>('/auth/me');
  return r.ok ? r.data : null;
}

export interface Plan {
  id: string;
  title: string;
  receiveTime: string;
  validity: string;
  warranty: string;
  /** Dòng mô tả quyền lợi (cấu hình ở BE); bản BE cũ chưa có thì FE dùng mặc định. */
  features?: string[];
  price: number;
  currency: string;
}

export { vnd, fmtSize } from './format';

export interface AppInfo {
  available: boolean;
  name?: string;
  version?: string;
  bundleId?: string;
  minOs?: string;
  size?: number;
  canDownload?: boolean;
  maxMb?: number;
}
