import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuildDiaspora Zimbabwe - Empowering Zimbabwean Development",
  description: "Connect with trusted professionals, access resources, and build your dreams in Zimbabwe. Your comprehensive platform for construction, development, and professional services.",
  keywords: ["Zimbabwe", "construction", "development", "professionals", "building", "diaspora"],
  authors: [{ name: "BuildDiaspora Zimbabwe" }],
  creator: "BuildDiaspora Zimbabwe",
  publisher: "BuildDiaspora Zimbabwe",
  metadataBase: new URL('https://builddiaspora.com'),
  openGraph: {
    title: "BuildDiaspora Zimbabwe - Empowering Zimbabwean Development",
    description: "Connect with trusted professionals, access resources, and build your dreams in Zimbabwe.",
    url: "https://builddiaspora.com",
    siteName: "BuildDiaspora Zimbabwe",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildDiaspora Zimbabwe - Empowering Zimbabwean Development",
    description: "Connect with trusted professionals, access resources, and build your dreams in Zimbabwe.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-verification-code-here",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B4B3A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
