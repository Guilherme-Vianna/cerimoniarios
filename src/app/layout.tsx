import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import { GoogleTag } from "@/components/analytics/google-tag";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME, APP_THEME_COLOR } from "@/lib/pwa";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <ServiceWorkerRegister />
        <GoogleTag />
      </body>
    </html>
  );
}
