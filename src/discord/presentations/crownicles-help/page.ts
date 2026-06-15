import type { CommandAuthorization } from '@/core/permissions/types.js';
import type { Container } from '@/discord/components/index.js';
import type { ReduceContext } from '@/discord/interactions/collector.js';
import type { CollectedInteraction } from 'discord.js';

/** Shared state of the help center; at minimum, which page is open. */
export interface HelpState {
  pageId: string;
}

/** Passed to a page's `render`; `disabled` is true once the menu times out. */
export interface HelpRenderContext {
  disabled: boolean;
}

/**
 * One page of the Crownicles help center. A page knows how to draw itself
 * (`render`) and react to a click/select on it (`reduce`), mirroring the
 * Render/Reduce contract of `InteractiveMessage` so the router can drive every
 * page through a single collector.
 */
export interface HelpPage {
  id: string;
  requiredAuthorization: CommandAuthorization;
  render(state: HelpState, ctx: HelpRenderContext): Container;
  reduce(
    interaction: CollectedInteraction,
    state: HelpState,
    ctx: ReduceContext,
  ): Promise<HelpState> | HelpState;
}
