import "./globals.css";

import Providers from "@/providers";
import { getMessages } from "@/lib/intl";
import { fredoka } from "./fonts";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages(locale);
  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${fredoka.variable} min-h-screen antialiased flex flex-col`}
      >
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
