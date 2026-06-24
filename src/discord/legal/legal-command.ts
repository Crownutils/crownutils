import { getAcceptance } from '@/core/legal/legal-repository.js';
import { resolveAuthorization } from '@/core/permissions/index.js';
import type { Container } from '@/discord/components/index.js';
import {
  buildLegalViewerContainer,
  type LegalStatus,
} from '@/discord/presentations/legal-presentation.js';

/** Result of the shared `/legal` logic: the viewer plus the acceptance status. */
export interface LegalCommandResult {
  container: Container;
  status: LegalStatus;
}

/** Resolves a user's acceptance status; the bot owner is exempt from accepting. */
async function resolveLegalStatus(userId: string): Promise<LegalStatus> {
  if (resolveAuthorization(userId) === 'owner') {
    return { kind: 'exempt' };
  }
  const acceptance = await getAcceptance(userId);
  return acceptance
    ? { kind: 'accepted', at: acceptance.acceptedAt }
    : { kind: 'pending' };
}

/** Shared `/legal` logic: resolves the user's status and builds the viewer. */
export async function runLegalCommand(
  userId: string,
): Promise<LegalCommandResult> {
  const status = await resolveLegalStatus(userId);
  return { container: buildLegalViewerContainer(status), status };
}
