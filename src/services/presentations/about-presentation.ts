import { lang } from '@/lang/index.js';
import { Container, Separator, Text, Title } from '@/lib/components/index.js';
import { env } from '@/lib/env.js';

const ownerGithubLink = 'https://github.com/Ntalcme';
const projectGithubUrl = 'https://github.com/Crownutils';

export function buildBotInfoContainer(): Container {
  return new Container().color('info').add(
    new Title(lang.commands.about.title),
    new Text(lang.commands.about.description.presentation),
    new Separator(),
    new Text(lang.commands.about.description.version(env.botVersion))
      .newLine(lang.commands.about.description.license.licenseName(env.license))
      .newLine(
        new Text(
          lang.commands.about.description.license.compatibilityWithCrownicles,
        )
          .size('subtle')
          .quote()
          .italic(),
      )
      .newLine(lang.commands.about.description.githubUrl(env.githubUrl)),
    new Separator(),
    new Text(lang.commands.about.description.usefulLinks.title)
      .size('small')
      .newLine(
        new Text(
          lang.commands.about.description.usefulLinks.projectGithubPage(
            projectGithubUrl,
          ),
        ).quote(),
      )
      .newLine(
        new Text(
          lang.commands.about.description.usefulLinks.ownerGithubPage(
            ownerGithubLink,
          ),
        ).quote(),
      ),
  );
}
