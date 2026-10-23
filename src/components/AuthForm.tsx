'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';

/** Chỉ cho chuyển hướng nội bộ (bắt đầu bằng một dấu /), chặn open redirect kiểu //evil.com hay /\evil.com. */
const safeNext = (n?: string) => (n && /^\/(?![/\\])/.test(n) ? n : '/dashboard');

const input =
  'min-h-[43px] w-full rounded-[10px] border border-line bg-gradient-to-b from-[#fafbf8] to-[#f4f6ef] px-3.5 py-3 text-xs outline-none focus:border-[#9cba72] focus:shadow-[0_0_0_3px_#d0e5ad30]';
const label = 'mb-2 block text-[11px] font-medium';

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

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 shadow-[0_5px_24px_#21361710]">
      <h1 className="mb-1 text-lg font-bold tracking-tight">{mode === 'login' ? 'Chào bạn trở lại' : 'Tạo tài khoản Metus'}</h1>
      <p className="mb-6 text-[11px] leading-[1.8] text-muted">
        {mode === 'login' ? 'Đăng nhập để quản lý chứng chỉ và đơn hàng của bạn.' : 'Quản lý chứng chỉ, ký IPA và đơn hàng ở một nơi.'}
      </p>

      <div className="mb-4">
        <label className={label} htmlFor="username">
          Tên đăng nhập
        </label>
        <input id="username" name="username" required autoComplete="username" placeholder="vd: nguyenvana" className={input} />
      </div>
      {mode === 'register' && (
        <div className="mb-4">
          <label className={label} htmlFor="fullName">
            Họ tên <span className="text-muted">(không bắt buộc)</span>
          </label>
          <input id="fullName" name="fullName" placeholder="Nguyễn Văn A" className={input} />
        </div>
      )}
      <div className="mb-5">
        <label className={label} htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === 'register' ? 8 : 1}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'register' ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu'}
          className={input}
        />
      </div>

      {error && (
        <p role="alert" className="mb-4 text-[11px] text-[#b45b45]">
          {error}
        </p>
      )}
      <button disabled={loading} className="w-full rounded-[9px] bg-deep py-3 text-xs font-semibold text-white hover:bg-deep-dark disabled:opacity-60">
        {loading ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
      </button>
    </form>
  );
}
