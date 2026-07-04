import type { SupportedLocale } from '@/core/types.js';
import { SUPPORTED_LOCALES } from '@/core/types.js';
import type { Container } from '../components/index.js';
import {
  createContainer,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '../components/index.js';
import { lang } from '../lang/index.js';

/** Custom id of the language select menu; read back by the controller's `reduce`. */
export const LANGUAGE_SELECT_ID = 'language-select';

/** Picker labels, each shown in its own language (endonyms). */
const LANGUAGE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
};

/** Flag emoji shown as each option's icon. */
const LANGUAGE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
};

/** Build the language picker; `disabled` greys the menu out for the final render. */
export function buildLanguageContainer(
  language: SupportedLocale,
  disabled: boolean,
): Container {
  const messages = lang[language].commandLanguage.messages;

  return createContainer('brand').add(
    new Text(messages.title).title(),
    new Separator(),
    new Text(messages.prompt),
    new SelectActionRow().set(
      new SelectMenu(LANGUAGE_SELECT_ID)
        .placeholder(messages.placeholder)
        .options(
          SUPPORTED_LOCALES.map((locale) => ({
            label: LANGUAGE_LABELS[locale],
            value: locale,
            emoji: LANGUAGE_FLAGS[locale],
            default: locale === language,
          })),
        )
        .disabled(disabled),
    ),
  );
}
