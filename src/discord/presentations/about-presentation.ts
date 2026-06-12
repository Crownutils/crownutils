import { lang } from '@/discord/lang/index.js';
import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { env } from '@/core/config/index.js';

const ownerGithubLink = 'https://github.com/Ntalcme';
const projectGithubUrl = 'https://github.com/Crownutils';

/** Builds the `/about` container: bot version, license, and useful links. */
export function buildBotInfoContainer(): Container {
  return new Container().color('info').add(
    new Title(lang.commands.about.messages.title),
    new Text(lang.commands.about.messages.presentation),
    new Separator(),
    new Text(lang.commands.about.messages.version(env.botVersion))
      .newLine(lang.commands.about.messages.license.licenseName(env.license))
      .newLine(
        new Text(
          lang.commands.about.messages.license.compatibilityWithCrownicles,
        )
          .size('subtle')
          .quote()
          .italic(),
      )
      .newLine(lang.commands.about.messages.githubUrl(env.githubUrl)),
    new Separator(),
    new Text(lang.commands.about.messages.usefulLinks.title)
      .size('small')
      .newLine(
        new Text(
          lang.commands.about.messages.usefulLinks.projectGithubPage(
            projectGithubUrl,
          ),
        ).quote(),
      )
      .newLine(
        new Text(
          lang.commands.about.messages.usefulLinks.ownerGithubPage(
            ownerGithubLink,
          ),
        ).quote(),
      ),
  );
}
