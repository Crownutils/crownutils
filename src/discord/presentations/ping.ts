import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../components/index.js';
import { createContainer, Separator, Text } from '../components/index.js';
import { lang } from '../lang/index.js';

export interface PingView {
  readonly totalLatencyMs: number;
  readonly discordLatencyMs: number;
}

/** Build the Components V2 container shown by the `ping` command. */
export function buildPingContainer(
  view: PingView,
  language: SupportedLocale,
): Container {
  const { title, totalLatency, discordLatency } =
    lang[language].commandPing.messages;

  return createContainer('brand').add(
    new Text(title).title(),
    new Separator(),
    new Text(discordLatency(view.discordLatencyMs)).newLine(
      totalLatency(view.totalLatencyMs),
    ),
  );
}
