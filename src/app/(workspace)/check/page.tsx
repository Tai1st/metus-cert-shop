import { redirect } from 'next/navigation';
import { getMe } from '@/lib/api';
import CheckForm from '@/components/CheckForm';

export const dynamic = 'force-dynamic';

export default async function CheckPage() {
  if (!(await getMe())) redirect('/login?next=/check');
  return <CheckForm />;
}
