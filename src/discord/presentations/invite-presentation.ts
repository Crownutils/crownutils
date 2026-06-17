import { Container, Text, Title } from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { env } from '@/core/config/index.js';

/** Builds the `/invite` container: the bot's invitation link. */
export function buildInviteContainer(): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.commands.invite.messages.title),
      new Text(lang.commands.invite.messages.description(env.inviteUrl)),
    );
}
