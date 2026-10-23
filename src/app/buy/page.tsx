import { redirect } from 'next/navigation';

// Trang mua hàng đã gộp vào trang chủ. Giữ lại đường dẫn này vì BE chuyển hướng iPhone về /buy?e=<token>.
export default async function BuyPage({ searchParams }: PageProps<'/buy'>) {
  const e = (await searchParams).e;
  redirect(typeof e === 'string' && e ? `/?e=${encodeURIComponent(e)}#install` : '/#install');
}
