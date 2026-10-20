import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../../components/index.js';
import { createContainer, Separator, Text } from '../../components/index.js';
import { icons } from '../../theme/icons.js';
import { lang } from '../../lang/index.js';
import { config } from '@/core/config/index.js';

/** The about card: presentation, archive notice, version, license and project links. */
export function buildAboutContainer(language: SupportedLocale): Container {
  const messages = lang[language].commandAbout.messages;

  return createContainer('brand').add(
    new Text(messages.title).icon(icons.info).title(),
    new Text(messages.presentation),
    new Separator(),
    new Text(messages.archived).icon(icons.archive),
    new Separator(),
    new Text(messages.version(config.botVersion))
      .newLine(messages.license.licenseName)
      .newLine(
        new Text(messages.license.compatibilityWithCrownicles(config.legalUrl))
          .italic()
          .size('subtle'),
      )
      .newLine(messages.sourceCode),
    new Separator(),
    new Text(messages.usefulLinks.title).size('small'),
    new Text(messages.usefulLinks.projectGithubPage(config.projectUrl)).newLine(
      messages.usefulLinks.ownerGithubPage(config.ownerUrl),
    ),
  );
}
