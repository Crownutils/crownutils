import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../components/index.js';
import { createContainer, Separator, Text } from '../components/index.js';
import { lang } from '../lang/index.js';
import { config } from '@/core/config/index.js';

export function buildAboutContainer(language: SupportedLocale): Container {
  const messages = lang[language].commandAbout.messages;

  return createContainer('brand').add(
    new Text(messages.title).title(),
    new Text(messages.presentation),
    new Separator(),
    new Text(messages.version(config.botVersion))
      .newLine(messages.license.licenseName(config.license))
      .newLine(
        new Text(messages.license.compatibilityWithCrownicles)
          .italic()
          .size('subtle'),
      )
      .newLine(messages.githubUrl(config.githubUrl)),
    new Separator(),
    new Text(messages.usefulLinks.title).size('small'),
    new Text(messages.usefulLinks.projectGithubPage(config.projectUrl)).newLine(
      messages.usefulLinks.ownerGithubPage(config.ownerUrl),
    ),
  );
}
