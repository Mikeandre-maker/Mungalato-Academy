import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venture Arena — Build. Survive. Pitch. Rise.",
  description: "An entrepreneurship simulation and AI-powered Investment Den for African founders.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
