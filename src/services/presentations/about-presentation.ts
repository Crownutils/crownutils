import { lang } from '@/lang/index.js';
import { Container, Text, Title } from '@/lib/components/index.js';
import { env } from '@/lib/env.js';

export function buildBotInfoContainer(): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.about.title),
      new Text(lang.about.description.version(env.botVersion))
        .newLine(lang.about.description.license.licenseName(env.license))
        .newLine(
          new Text(
            lang.about.description.license.compatibilityWithCrownicles,
          ).size('subtle'),
        )
        .newLine(lang.about.description.githubUrl(env.githubUrl)),
    );
}
