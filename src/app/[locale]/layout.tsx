import { notFound } from "next/navigation";

import AuthSessionManager from "@/components/auth/AuthSessionManager";

const locales = ["ar", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>) {
  const { locale } =
    await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <div
      lang={locale}
      dir={
        locale === "ar"
          ? "rtl"
          : "ltr"
      }
    >
      <AuthSessionManager />

      {children}
    </div>
  );
}