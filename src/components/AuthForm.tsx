'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';

/** Chỉ cho chuyển hướng nội bộ (bắt đầu bằng một dấu /), chặn open redirect kiểu //evil.com hay /\evil.com. */
const safeNext = (n?: string) => (n && /^\/(?![/\\])/.test(n) ? n : '/');

export default function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await post(`/auth/${mode}`, f);
    setLoading(false);
    if (!r.ok) return setError(r.error);
    router.push(safeNext(next));
    router.refresh();
  }

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-lg font-semibold">{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h1>
      <input name="username" required autoComplete="username" placeholder="Tên đăng nhập" className={input} />
      {mode === 'register' && <input name="fullName" placeholder="Họ tên (không bắt buộc)" className={input} />}
      <input
        name="password"
        type="password"
        required
        minLength={mode === 'register' ? 8 : 1}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        placeholder={mode === 'register' ? 'Mật khẩu (tối thiểu 8 ký tự)' : 'Mật khẩu'}
        className={input}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-ink py-2 text-sm font-medium text-white disabled:opacity-60">
        {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
      </button>
    </form>
  );
}
