import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexHome - Armário Multifuncional | Triunfo Home Design",
  description: "FlexHome - Armário Multifuncional. Pague 1 e leve 2.",
  icons: { icon: "/images/oILg2cf6VMfI.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/css/BfDe2pjOPHWZ.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.pixelId = "6a30ffc14786e07a2af315fd";
              var a = document.createElement("script");
              a.setAttribute("async", "");
              a.setAttribute("defer", "");
              a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
              document.head.appendChild(a);
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.COBERDROM_CONFIG = { buyButtonUrl: "" };
            `,
          }}
        />
      </head>
      <body>
        {children}
        <script src="/js/AxVL7LwBujgu.js" defer></script>
        <script src="/js/yFVPl407oWCP.js" defer></script>
      </body>
    </html>
  );
}
