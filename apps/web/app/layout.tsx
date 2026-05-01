import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FeetFans Marketplace',
  description: 'Anonymous marketplace for foot content creators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
