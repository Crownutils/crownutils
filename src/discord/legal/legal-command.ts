import { getAcceptance } from '@/core/legal/legal-repository.js';
import type { Container } from '@/discord/components/index.js';
import { buildLegalViewerContainer } from '@/discord/presentations/legal-presentation.js';

/** Result of the shared `/legal` logic: the viewer plus the acceptance date. */
export interface LegalCommandResult {
  container: Container;
  acceptedAt: Date | null;
}

/** Shared `/legal` logic: resolves the user's acceptance and builds the viewer. */
export async function runLegalCommand(
  userId: string,
): Promise<LegalCommandResult> {
  const acceptance = await getAcceptance(userId);
  const acceptedAt = acceptance?.acceptedAt ?? null;
  return { container: buildLegalViewerContainer(acceptedAt), acceptedAt };
}
