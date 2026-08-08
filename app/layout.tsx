import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const rawHost = forwardedHost || requestHeaders.get("host") || "nexocv.openai.site";
  const host = /^[a-z0-9.-]+(?::\d+)?$/i.test(rawHost) ? rawHost : "nexocv.openai.site";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : host.startsWith("localhost")
      ? "http"
      : "https";
  const origin = `${protocol}://${host}`;
  const title = "NexoCV — Compatibilidade entre currículo e vaga";
  const description =
    "Compare seu currículo com uma vaga e descubra competências alinhadas, lacunas e próximos ajustes antes de se candidatar.";

  return {
    metadataBase: new URL(origin),
    title: { default: title, template: "%s | NexoCV" },
    description,
    keywords: [
      "análise de currículo",
      "compatibilidade com vaga",
      "currículo ATS",
      "emprego",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      locale: "pt_BR",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1728,
          height: 909,
          alt: "NexoCV — Seu currículo fala a língua da vaga?",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
