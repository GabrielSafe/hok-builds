import type { Metadata } from "next";
import { Inter, Montserrat, Orbitron } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics";
import LoadingScreen from "@/components/layout/LoadingScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable} ${orbitron.variable}`}>
      <body className="min-h-screen text-gray-100 font-sans antialiased bg-[#0B0F17]">
        <GoogleAnalytics />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
