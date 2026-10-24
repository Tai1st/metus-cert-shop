import { getMe } from '@/lib/api';
import Workspace from '@/components/Workspace';

export default async function WorkspaceLayout({ children }: LayoutProps<'/'>) {
  const user = await getMe();
  return (
    <Workspace user={user ? { username: user.username } : null}>{children}</Workspace>
  );
}
