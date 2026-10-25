import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://venturearena.africa"),
  title: {
    default: "Venture Arena — Build. Survive. Pitch. Rise.",
    template: "%s | Venture Arena",
  },
  description:
    "An entrepreneurship simulation and AI-powered Investment Den for African founders.",
  openGraph: {
    title: "Venture Arena",
    description:
      "An entrepreneurship simulation and AI-powered Investment Den for African founders.",
    url: "https://venturearena.africa",
    siteName: "Venture Arena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Venture Arena",
    description:
      "An entrepreneurship simulation and AI-powered Investment Den for African founders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
