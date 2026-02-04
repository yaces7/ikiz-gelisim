import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "İkiz Gelişim Platformu",
  description: "İkiz ergenlerin ayrışma-bütünleşme süreci, bireyselleşme ve kimlik gelişimlerini desteklemeye yönelik platform",
};


import { Providers } from "./providers";

import { Suspense } from 'react';
import LoadingScreen from './components/LoadingScreen';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
