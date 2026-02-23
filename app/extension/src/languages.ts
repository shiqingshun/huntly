// Language definition with English name and native name
export type LanguageOption = {
  code: string;      // ISO language code
  english: string;   // English name
  native: string;    // Native name in that language
}

// Language list sorted by global usage/popularity
export const LANGUAGES: LanguageOption[] = [
  { code: 'en', english: 'English', native: 'English' },
  { code: 'zh-Hans', english: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'zh-Hant', english: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'es', english: 'Spanish', native: 'Español' },
  { code: 'ja', english: 'Japanese', native: '日本語' },
  { code: 'ko', english: 'Korean', native: '한국어' },
  { code: 'fr', english: 'French', native: 'Français' },
  { code: 'de', english: 'German', native: 'Deutsch' },
  { code: 'pt', english: 'Portuguese', native: 'Português' },
  { code: 'ru', english: 'Russian', native: 'Русский' },
  { code: 'ar', english: 'Arabic', native: 'العربية' },
  { code: 'it', english: 'Italian', native: 'Italiano' },
  { code: 'nl', english: 'Dutch', native: 'Nederlands' },
  { code: 'pl', english: 'Polish', native: 'Polski' },
  { code: 'vi', english: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', english: 'Thai', native: 'ไทย' },
  { code: 'id', english: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'tr', english: 'Turkish', native: 'Türkçe' },
  { code: 'hi', english: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', english: 'Bengali', native: 'বাংলা' },
  { code: 'uk', english: 'Ukrainian', native: 'Українська' },
  { code: 'cs', english: 'Czech', native: 'Čeština' },
  { code: 'sv', english: 'Swedish', native: 'Svenska' },
  { code: 'da', english: 'Danish', native: 'Dansk' },
  { code: 'fi', english: 'Finnish', native: 'Suomi' },
  { code: 'no', english: 'Norwegian', native: 'Norsk' },
  { code: 'el', english: 'Greek', native: 'Ελληνικά' },
  { code: 'he', english: 'Hebrew', native: 'עברית' },
  { code: 'ro', english: 'Romanian', native: 'Română' },
  { code: 'hu', english: 'Hungarian', native: 'Magyar' },
  { code: 'ms', english: 'Malay', native: 'Bahasa Melayu' },
  { code: 'fa', english: 'Persian', native: 'فارسی' },
];

