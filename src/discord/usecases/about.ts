import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import { buildAboutContainer } from '../presentations/index.js';

/** Builds the `about` command's static response: bot info, links and license. */
export function runAboutCommand(language: SupportedLocale): CommandResponse {
  return {
    container: buildAboutContainer(language),
  };
}
