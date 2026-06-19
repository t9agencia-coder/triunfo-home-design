import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexHome - Armário Multifuncional | Triunfo Home Design",
  description: "FlexHome - Armário Multifuncional. Pague 1 e leve 2.",
  icons: { icon: "/images/oILg2cf6VMfI.png" },
};

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="/css/BfDe2pjOPHWZ.css" />

        {/* Meta Pixel — stub + init sem PageView automático (metatrack.js dispara com eventID) */}
        {META_PIXEL_ID && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');
          `}} />
        )}

        {/* metatrack.js — sessão, UTMs, fbp/fbc, despacho de eventos */}
        <script src="/js/metatrack.js?v=1" defer></script>

        <script dangerouslySetInnerHTML={{ __html: `window.COBERDROM_CONFIG = { buyButtonUrl: "" };` }} />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `history.scrollRestoration="manual";window.scrollTo(0,0);` }} />
        {children}
      </body>
    </html>
  );
}
