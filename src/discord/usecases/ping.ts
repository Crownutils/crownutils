import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import { buildPingContainer } from '../presentations/index.js';

export interface RunPingInput {
  readonly totalLatencyMs: number;
  readonly discordLatencyMs: number;
}

export function runPingCommand(
  input: RunPingInput,
  language: SupportedLocale,
): CommandResponse {
  return {
    container: buildPingContainer(
      {
        totalLatencyMs: input.totalLatencyMs,
        discordLatencyMs: input.discordLatencyMs,
      },
      language,
    ),
  };
}
