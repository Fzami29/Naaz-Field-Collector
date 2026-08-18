import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Naaz Field Collector",
  description: "Secure data collection and field operations dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col pb-16 md:pb-0`}>
        <ToastProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
