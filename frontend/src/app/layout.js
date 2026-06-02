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

export const metadata = {
  title: "AI News Intelligence Platform",
description: "AI-powered real-time news intelligence with smart summaries and contextual analysis.",
};

// src/app/layout.js

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Add the attribute right here to stop extensions from breaking your console */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}