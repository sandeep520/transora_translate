export interface Language {
  /** ISO 639-1 code used by translation providers. */
  code: string;
  /** Human-readable name shown in the UI. */
  name: string;
  /** Short label used when generating download filenames. */
  short: string;
  /** True for right-to-left scripts (Arabic, Hebrew, Persian, Urdu…). */
  rtl?: boolean;
}

/** "auto" is special: it asks the provider to detect the source language. */
export const AUTO_DETECT: Language = {
  code: "auto",
  name: "Auto Detect",
  short: "auto",
};

/**
 * Full list of languages supported by the default (Google) provider.
 * Codes follow what the translation endpoints expect. RTL scripts are flagged.
 * Add a new language by appending an entry here — it appears in both dropdowns
 * automatically.
 */
export const LANGUAGES: Language[] = [
  { code: "af", name: "Afrikaans", short: "af" },
  { code: "sq", name: "Albanian", short: "sq" },
  { code: "am", name: "Amharic", short: "am" },
  { code: "ar", name: "Arabic", short: "ar", rtl: true },
  { code: "hy", name: "Armenian", short: "hy" },
  { code: "az", name: "Azerbaijani", short: "az" },
  { code: "eu", name: "Basque", short: "eu" },
  { code: "be", name: "Belarusian", short: "be" },
  { code: "bn", name: "Bengali", short: "bn" },
  { code: "bs", name: "Bosnian", short: "bs" },
  { code: "bg", name: "Bulgarian", short: "bg" },
  { code: "ca", name: "Catalan", short: "ca" },
  { code: "ceb", name: "Cebuano", short: "ceb" },
  { code: "ny", name: "Chichewa", short: "ny" },
  { code: "zh", name: "Chinese (Simplified)", short: "zh" },
  { code: "zh-TW", name: "Chinese (Traditional)", short: "zh-TW" },
  { code: "co", name: "Corsican", short: "co" },
  { code: "hr", name: "Croatian", short: "hr" },
  { code: "cs", name: "Czech", short: "cs" },
  { code: "da", name: "Danish", short: "da" },
  { code: "nl", name: "Dutch", short: "nl" },
  { code: "en", name: "English", short: "en" },
  { code: "eo", name: "Esperanto", short: "eo" },
  { code: "et", name: "Estonian", short: "et" },
  { code: "tl", name: "Filipino", short: "tl" },
  { code: "fi", name: "Finnish", short: "fi" },
  { code: "fr", name: "French", short: "fr" },
  { code: "fy", name: "Frisian", short: "fy" },
  { code: "gl", name: "Galician", short: "gl" },
  { code: "ka", name: "Georgian", short: "ka" },
  { code: "de", name: "German", short: "de" },
  { code: "el", name: "Greek", short: "el" },
  { code: "gu", name: "Gujarati", short: "gu" },
  { code: "ht", name: "Haitian Creole", short: "ht" },
  { code: "ha", name: "Hausa", short: "ha" },
  { code: "haw", name: "Hawaiian", short: "haw" },
  { code: "he", name: "Hebrew", short: "he", rtl: true },
  { code: "hi", name: "Hindi", short: "hi" },
  { code: "hmn", name: "Hmong", short: "hmn" },
  { code: "hu", name: "Hungarian", short: "hu" },
  { code: "is", name: "Icelandic", short: "is" },
  { code: "ig", name: "Igbo", short: "ig" },
  { code: "id", name: "Indonesian", short: "id" },
  { code: "ga", name: "Irish", short: "ga" },
  { code: "it", name: "Italian", short: "it" },
  { code: "ja", name: "Japanese", short: "ja" },
  { code: "jw", name: "Javanese", short: "jw" },
  { code: "kn", name: "Kannada", short: "kn" },
  { code: "kk", name: "Kazakh", short: "kk" },
  { code: "km", name: "Khmer", short: "km" },
  { code: "rw", name: "Kinyarwanda", short: "rw" },
  { code: "ko", name: "Korean", short: "ko" },
  { code: "ku", name: "Kurdish (Kurmanji)", short: "ku" },
  { code: "ky", name: "Kyrgyz", short: "ky" },
  { code: "lo", name: "Lao", short: "lo" },
  { code: "la", name: "Latin", short: "la" },
  { code: "lv", name: "Latvian", short: "lv" },
  { code: "lt", name: "Lithuanian", short: "lt" },
  { code: "lb", name: "Luxembourgish", short: "lb" },
  { code: "mk", name: "Macedonian", short: "mk" },
  { code: "mg", name: "Malagasy", short: "mg" },
  { code: "ms", name: "Malay", short: "ms" },
  { code: "ml", name: "Malayalam", short: "ml" },
  { code: "mt", name: "Maltese", short: "mt" },
  { code: "mi", name: "Maori", short: "mi" },
  { code: "mr", name: "Marathi", short: "mr" },
  { code: "mn", name: "Mongolian", short: "mn" },
  { code: "my", name: "Myanmar (Burmese)", short: "my" },
  { code: "ne", name: "Nepali", short: "ne" },
  { code: "no", name: "Norwegian", short: "no" },
  { code: "or", name: "Odia (Oriya)", short: "or" },
  { code: "ps", name: "Pashto", short: "ps", rtl: true },
  { code: "fa", name: "Persian", short: "fa", rtl: true },
  { code: "pl", name: "Polish", short: "pl" },
  { code: "pt", name: "Portuguese", short: "pt" },
  { code: "pa", name: "Punjabi", short: "pa" },
  { code: "ro", name: "Romanian", short: "ro" },
  { code: "ru", name: "Russian", short: "ru" },
  { code: "sm", name: "Samoan", short: "sm" },
  { code: "gd", name: "Scots Gaelic", short: "gd" },
  { code: "sr", name: "Serbian", short: "sr" },
  { code: "st", name: "Sesotho", short: "st" },
  { code: "sn", name: "Shona", short: "sn" },
  { code: "sd", name: "Sindhi", short: "sd", rtl: true },
  { code: "si", name: "Sinhala", short: "si" },
  { code: "sk", name: "Slovak", short: "sk" },
  { code: "sl", name: "Slovenian", short: "sl" },
  { code: "so", name: "Somali", short: "so" },
  { code: "es", name: "Spanish", short: "es" },
  { code: "su", name: "Sundanese", short: "su" },
  { code: "sw", name: "Swahili", short: "sw" },
  { code: "sv", name: "Swedish", short: "sv" },
  { code: "tg", name: "Tajik", short: "tg" },
  { code: "ta", name: "Tamil", short: "ta" },
  { code: "tt", name: "Tatar", short: "tt" },
  { code: "te", name: "Telugu", short: "te" },
  { code: "th", name: "Thai", short: "th" },
  { code: "tr", name: "Turkish", short: "tr" },
  { code: "tk", name: "Turkmen", short: "tk" },
  { code: "uk", name: "Ukrainian", short: "uk" },
  { code: "ur", name: "Urdu", short: "ur", rtl: true },
  { code: "ug", name: "Uyghur", short: "ug", rtl: true },
  { code: "uz", name: "Uzbek", short: "uz" },
  { code: "vi", name: "Vietnamese", short: "vi" },
  { code: "cy", name: "Welsh", short: "cy" },
  { code: "xh", name: "Xhosa", short: "xh" },
  { code: "yi", name: "Yiddish", short: "yi", rtl: true },
  { code: "yo", name: "Yoruba", short: "yo" },
  { code: "zu", name: "Zulu", short: "zu" },
];

/** Source dropdown allows Auto Detect; target dropdown does not. */
export const SOURCE_LANGUAGES: Language[] = [AUTO_DETECT, ...LANGUAGES];
export const TARGET_LANGUAGES: Language[] = [...LANGUAGES];

export function getLanguageByCode(code: string): Language | undefined {
  if (code === AUTO_DETECT.code) return AUTO_DETECT;
  return LANGUAGES.find((l) => l.code === code);
}

/** Whether a language code uses a right-to-left script. */
export function isRtlLang(code: string): boolean {
  return Boolean(getLanguageByCode(code)?.rtl);
}
