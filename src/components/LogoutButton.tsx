'use client';

import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="text-slate-500 hover:text-slate-900"
      onClick={async () => {
        await post('/auth/logout');
        router.push('/');
        router.refresh();
      }}
    >
      Đăng xuất
    </button>
  );
}
