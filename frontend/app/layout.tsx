import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duolingo – The world's best way to learn a language",
  description: "Learn Spanish, French, German, and more with Duolingo – the fun, free language-learning app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
