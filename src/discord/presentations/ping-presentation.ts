import { lang } from '@/discord/lang/index.js';
import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';

/** Builds the `/ping` result container showing total and Discord latency. */
export function buildPingResultContainer(
  totalMs: number,
  discordMs: number,
): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.commands.ping.messages.title),
      new Separator(),
      new Text(lang.commands.ping.messages.totalLatence(totalMs)).newLine(
        lang.commands.ping.messages.discordLatence(discordMs),
      ),
    );
}
