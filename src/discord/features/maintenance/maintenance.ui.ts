import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../../components/index.js';
import { createContainer, Text } from '../../components/index.js';
import { lang } from '../../lang/index.js';

/** Confirmation shown after the owner toggles maintenance mode; colour reflects the new state. */
export function buildMaintenanceContainer(
  language: SupportedLocale,
  enabled: boolean,
): Container {
  const messages = lang[language].commandMaintenance.messages;
  return createContainer(enabled ? 'warn' : 'success').add(
    new Text(enabled ? messages.enabled : messages.disabled),
  );
}
