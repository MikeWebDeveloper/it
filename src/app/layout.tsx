import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PWAInstaller } from "@/components/PWAInstaller";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
};

export const metadata: Metadata = {
  title: "IT Quiz App | IT Essentials Exam Prep",
  description: "Master IT Essentials with interactive quizzes, progress tracking, and personalized learning paths. Mobile-first exam preparation app.",
  keywords: "IT certification, IT essentials, exam prep, quiz app, mobile learning",
  authors: [{ name: "IT Quiz App" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IT Quiz App"
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PWAInstaller />
        </ThemeProvider>
      </body>
    </html>
  );
}
