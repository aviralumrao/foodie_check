import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import logo from "./logo.png";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pack Sure",
  description: "Packaged food compliance verification",
  icons: {
    icon: logo.src,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
