import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/respond.js';
import { buildAboutContainer } from '../presentations/index.js';

export function runAboutCommand(language: SupportedLocale): CommandResponse {
  return {
    container: buildAboutContainer(language),
  };
}
