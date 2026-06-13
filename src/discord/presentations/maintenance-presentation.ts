import { lang } from '@/discord/lang/index.js';
import { Container, Text } from '@/discord/components/index.js';

/** Builds the confirmation container shown after toggling maintenance mode. */
export function buildMaintenanceToggledContainer(enabled: boolean): Container {
  const message = enabled
    ? lang.commands.maintenance.messages.enabled
    : lang.commands.maintenance.messages.disabled;

  return new Container()
    .color(enabled ? 'warning' : 'success')
    .add(new Text(message));
}
