import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Fruit Slash 3D | Next.js & Three.js Fruit Cutting Hero Experience",
  description:
    "An interactive 3D WebGL fruit slicing experience powered by Three.js, React 19, and Next.js 16 with customizable blade colors and ballistic physics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
        <body className="min-h-full bg-[#060212] text-zinc-100 flex flex-col antialiased selection:bg-fuchsia-500 selection:text-white">
          {children}
        </body>
    </html>
  );
}

