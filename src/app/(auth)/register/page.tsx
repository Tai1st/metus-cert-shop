import AuthForm from '@/components/AuthForm';

export default async function RegisterPage({ searchParams }: PageProps<'/register'>) {
  const next = (await searchParams).next;
  return <AuthForm mode="register" next={typeof next === 'string' ? next : undefined} />;
}
