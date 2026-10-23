import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import IconSprite from '@/components/IconSprite';
import { LanguagePickerGate } from '@/components/LanguagePicker';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';

const font = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Metus — Mở rộng trải nghiệm iPhone',
  description: 'Chứng chỉ iOS, ký IPA, kho ứng dụng và quản lý cài đặt cho Metus Browser.',
};

// Khung ngoài cùng chỉ còn html/body/font; phần đầu trang và chân trang do từng nhóm route tự quyết định
// (trang chủ dùng topbar quảng bá, các trang còn lại dùng khung "Không gian của bạn" có thanh bên).
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi" className={`${font.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full text-[14px]">
        <IconSprite />
        <I18nProvider>
          <LanguagePickerGate />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
