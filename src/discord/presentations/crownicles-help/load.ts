import type { MessageComponentInteraction } from 'discord.js';
import type { Container } from '@/discord/components/index.js';
import { safeDiscord } from '@/discord/errors.js';
import type { HelpState } from './page.js';

interface LoadIntoPage<T> {
  interaction: MessageComponentInteraction;
  handled: () => void;
  render: (state: HelpState) => Container;
  loadingState: HelpState;
  load: () => Promise<T>;
  onLoaded: (value: T) => HelpState;
  onError: () => HelpState;
  logContext: string;
}

/**
 * Shared "loading" flow for data-backed help pages: shows `loadingState` and
 * acknowledges the interaction (calling `handled`), runs the network `load`,
 * then edits the message in place with the loaded (or error) state. Returns the
 * resulting {@link HelpState}.
 */
export async function loadIntoPage<T>({
  interaction,
  handled,
  render,
  loadingState,
  load,
  onLoaded,
  onError,
  logContext,
}: LoadIntoPage<T>): Promise<HelpState> {
  await interaction.update(render(loadingState).build());
  handled();
  try {
    const loaded = onLoaded(await load());
    await safeDiscord(
      interaction.message.edit(render(loaded).build()),
      `${logContext}.load`,
    );
    return loaded;
  } catch {
    const errored = onError();
    await safeDiscord(
      interaction.message.edit(render(errored).build()),
      `${logContext}.loadError`,
    );
    return errored;
  }
}
