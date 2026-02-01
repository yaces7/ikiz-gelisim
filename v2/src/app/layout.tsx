
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "İkiz Gelişim Platformu | Bireyselleşme Yolculuğu",
  description: "İkiz bireylerinin bireyselleşme süreçlerini destekleyen dijital platform. 6 haftalık program ile kişisel gelişim.",
  keywords: "ikiz, bireyselleşme, psikoloji, aile, gelişim, platform",
  authors: [{ name: "İkiz Araştırma Ekibi" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="orb orb-primary w-[600px] h-[600px] -top-40 -left-40 animate-pulse" />
          <div className="orb orb-secondary w-[500px] h-[500px] top-1/2 -right-40 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="orb orb-accent w-[400px] h-[400px] -bottom-20 left-1/3 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <AuthProvider>
          <Navbar />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
