import type { Metadata } from "next";
import "../styles/globals.css";
import CaseStudyCursor from "@/components/CaseStudyCursor";

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
      <head>
        {/* Hotjar Tracking Code for https://www.edgarsanchez.design */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3837615,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`,
          }}
        />
      </head>
      {/*
        font-body is the default typeface (Cabinet Grotesk).
        Individual components opt-in to font-display (Clash Display)
        via the font-display Tailwind utility.
      */}
      <body className="font-body bg-surface-base antialiased">
        {children}
        <CaseStudyCursor />
      </body>
    </html>
  );
}
