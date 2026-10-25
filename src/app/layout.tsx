import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#05090B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "TRP – The Roll Palace | One Bite – Full Flavour",
    template: "%s | TRP – The Roll Palace",
  },
  description:
    "Official online ordering system for TRP – The Roll Palace. Authentic Pakistani fast food, signature crispy rolls, molten cheese lava burgers, and charcoal BBQ.",
  keywords: [
    "TRP",
    "The Roll Palace",
    "Roll Palace Karachi",
    "Lava Burger",
    "Crispy Roll",
    "Zinger Burger",
    "BBQ Tikka",
    "Fast Food Karachi",
  ],
  authors: [{ name: "TRP – The Roll Palace" }],
  icons: {
    icon: "/images/trp-logo.png",
    apple: "/images/trp-logo.png",
  },
  openGraph: {
    title: "TRP – The Roll Palace | Taste That Rules",
    description: "One Bite – Full Flavour. Order online with live delivery tracking.",
    url: "https://trp-the-roll-palace.netlify.app",
    siteName: "TRP – The Roll Palace",
    images: [
      {
        url: "/images/trp-logo.png",
        width: 800,
        height: 800,
        alt: "TRP The Roll Palace Official Brand Logo",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Restaurant Structured Data for SEO (Phase 17)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "TRP – The Roll Palace",
    image: "https://trp-the-roll-palace.netlify.app/images/trp-logo.png",
    telephone: "+923243235253",
    servesCuisine: "Pakistani, Fast Food, BBQ",
    priceRange: "PKR 150 - 1950",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Karachi",
      addressCountry: "PK",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "16:00",
        closes: "03:00",
      },
    ],
    menu: "https://trp-the-roll-palace.netlify.app/#menu",
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#05090b] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
