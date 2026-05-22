import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Edgar Sanchez — Product Designer",
  description:
    "Senior product designer with 5 years of experience in B2B/Enterprise products. " +
    "Available for senior IC and lead design roles at product-led companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        font-body is the default typeface (Cabinet Grotesk).
        Individual components opt-in to font-display (Clash Display)
        via the font-display Tailwind utility.
      */}
      <body className="font-body bg-surface-base text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
