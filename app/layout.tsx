import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HOK Builds — Honor of Kings",
    template: "%s | HOK Builds",
  },
  description: "As melhores builds, arcana, feitiços e guias para todos os heróis de Honor of Kings.",
  keywords: ["honor of kings", "builds", "guias", "heróis", "arcana", "hok"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "HOK Builds",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-dark-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}
