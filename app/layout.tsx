import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '부동산 주간 상승률 지도',
  description: '한국부동산원 주간 아파트 매매가격 변동률 기반',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
