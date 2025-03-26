import type { Country, Language, Currency } from "@/types"

export const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
]

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
]

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
]

// Get default currency for a country
export function getDefaultCurrencyForCountry(countryCode: string): Currency {
  const currencyMap: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    CA: "CAD",
    AU: "AUD",
    DE: "EUR",
    FR: "EUR",
    JP: "JPY",
    CN: "CNY",
    IN: "INR",
    BR: "BRL",
    MX: "MXN",
    ES: "EUR",
    IT: "EUR",
    RU: "RUB",
    KR: "KRW",
  }

  const currencyCode = currencyMap[countryCode] || "USD"
  return currencies.find((c) => c.code === currencyCode) || currencies[0]
}

// Get default language for a country
export function getDefaultLanguageForCountry(countryCode: string): Language {
  const languageMap: Record<string, string> = {
    US: "en",
    GB: "en",
    CA: "en",
    AU: "en",
    DE: "de",
    FR: "fr",
    JP: "ja",
    CN: "zh",
    IN: "hi",
    BR: "pt",
    MX: "es",
    ES: "es",
    IT: "it",
    RU: "ru",
    KR: "ko",
  }

  const languageCode = languageMap[countryCode] || "en"
  return languages.find((l) => l.code === languageCode) || languages[0]
}

// Format currency
export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

// Convert currency (mock implementation - in a real app, you'd use an API)
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // Mock exchange rates (in a real app, you'd fetch these from an API)
  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.23,
    CAD: 1.36,
    AUD: 1.52,
    CNY: 7.24,
    INR: 83.12,
    BRL: 5.05,
    MXN: 16.73,
    RUB: 91.25,
    KRW: 1345.67,
  }

  // Convert to USD first (if not already USD)
  const amountInUSD = fromCurrency === "USD" ? amount : amount / rates[fromCurrency]

  // Convert from USD to target currency
  return toCurrency === "USD" ? amountInUSD : amountInUSD * rates[toCurrency]
}

// Mock translation function (in a real app, you'd use a translation API)
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // This is a mock function - in a real app, you'd call a translation API
  if (targetLanguage === "en") return text // No translation needed

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // For demo purposes, we'll just add a prefix to show it's "translated"
  const translations: Record<string, string> = {
    es: `[ES] ${text}`,
    fr: `[FR] ${text}`,
    de: `[DE] ${text}`,
    it: `[IT] ${text}`,
    pt: `[PT] ${text}`,
    ru: `[RU] ${text}`,
    ja: `[JA] ${text}`,
    zh: `[ZH] ${text}`,
    ar: `[AR] ${text}`,
    hi: `[HI] ${text}`,
    ko: `[KO] ${text}`,
  }

  return translations[targetLanguage] || text
}

// Extract currency values from text
export function extractCurrencyValues(text: string): { value: number; currency: string }[] {
  // This is a simplified implementation - in a real app, you'd use more sophisticated regex
  const currencyRegex = /(\$|€|£|¥|₹|R\$|₽|₩)\s?(\d+(?:\.\d+)?)/g
  const matches = [...text.matchAll(currencyRegex)]

  return matches.map((match) => {
    const symbol = match[1]
    const value = Number.parseFloat(match[2])

    // Map symbol to currency code
    const symbolToCurrency: Record<string, string> = {
      $: "USD",
      "€": "EUR",
      "£": "GBP",
      "¥": "JPY", // Could be JPY or CNY, we'll default to JPY
      "₹": "INR",
      R$: "BRL",
      "₽": "RUB",
      "₩": "KRW",
    }

    return {
      value,
      currency: symbolToCurrency[symbol] || "USD",
    }
  })
}

// Replace currency values in text
export function replaceCurrencyValues(text: string, targetCurrency: string): string {
  const currencyValues = extractCurrencyValues(text)
  let newText = text

  currencyValues.forEach(({ value, currency }) => {
    const convertedValue = convertCurrency(value, currency, targetCurrency)
    const formattedValue = formatCurrency(convertedValue, targetCurrency)

    // Replace the original value with the converted one
    // This is a simplified implementation - in a real app, you'd need more precise replacement
    const regex = new RegExp(`(\\$|€|£|¥|₹|R\\$|₽|₩)\\s?(${value})`)
    newText = newText.replace(regex, formattedValue)
  })

  return newText
}

