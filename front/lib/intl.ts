export async function getMessages(locale: string) {
  try {
    const messages = await import(`@/public/locales/messages/${locale}.ts`);
    return messages.default;
  } catch (error) {
    // Fallback to English if locale not found
    const messages = await import(`@/public/locales/messages/en.ts`);
    return messages.default;
    console.log(error);
  }
}

export function generateSEOMetadata(
  messages: Record<string, string>,
  titleKey: string,
  descriptionKey: string,
  locale = "en"
) {
  return {
    title: messages[titleKey],
    description: messages[descriptionKey],
    openGraph: {
      title: messages[titleKey],
      description: messages[descriptionKey],
      type: "website" as const,
      locale,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: messages[titleKey],
      description: messages[descriptionKey],
    },
  };
}
