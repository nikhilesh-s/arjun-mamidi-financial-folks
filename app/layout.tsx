import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { Providers } from '@/components/providers';

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'] 
});

export const metadata: Metadata = {
  title: 'Financial Folks',
  description: 'Fun lessons, activities, and resources to help kids build healthy money habits for life.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body className={`${nunito.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}