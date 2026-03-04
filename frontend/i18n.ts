import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["en", "ar"] as const;

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = supportedLocales.includes(locale as (typeof supportedLocales)[number]) ? locale : "en";
  return {
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});
