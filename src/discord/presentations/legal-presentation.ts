import type { Message } from 'discord.js';
import { acceptLegal } from '@/core/legal/legal-repository.js';
import {
  ActionRow,
  Button,
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import { lang } from '@/discord/lang/index.js';
import { relativeTimestamp } from '@/discord/timestamps.js';

const VIEWER_IDLE_MS = 120_000;
const GATE_IDLE_MS = 120_000;

const PRIVACY_BUTTON_ID = 'legal-privacy';
const TERMS_BUTTON_ID = 'legal-terms';
const ACCEPT_BUTTON_ID = 'legal-accept';

const m = lang.commands.legal.messages;

/** Which legal document is currently displayed in the `/legal` viewer. */
type LegalDocument = 'privacy' | 'terms';

/** State of the `/legal` viewer: active tab and the user's acceptance date. */
export interface LegalViewState {
  document: LegalDocument;
  acceptedAt: Date | null;
}

function statusLine(acceptedAt: Date | null): string {
  return acceptedAt
    ? m.status.accepted({ when: relativeTimestamp(acceptedAt) })
    : m.status.notAccepted;
}

/** Renders the `/legal` viewer: intro, the selected document, and controls. */
function renderViewer(state: LegalViewState, disabled: boolean): Container {
  const isPrivacy = state.document === 'privacy';

  const privacyTab = new Button(PRIVACY_BUTTON_ID)
    .label(m.privacyTab)
    .color(isPrivacy ? 'primary' : 'secondary');
  const termsTab = new Button(TERMS_BUTTON_ID)
    .label(m.termsTab)
    .color(isPrivacy ? 'secondary' : 'primary');
  if (disabled) {
    privacyTab.disabled();
    termsTab.disabled();
  }

  const container = new Container()
    .color('info')
    .add(
      new Title(m.title),
      new Text(m.intro).size('subtle'),
      new Separator(),
      new Title(isPrivacy ? m.privacyHeading : m.termsHeading, 'small'),
      new Text(isPrivacy ? m.privacyBody : m.termsBody),
      new Separator(),
      new Text(statusLine(state.acceptedAt)).size('subtle'),
      new ActionRow(privacyTab, termsTab),
    );

  if (!state.acceptedAt) {
    const accept = new Button(ACCEPT_BUTTON_ID)
      .label(m.acceptButton)
      .color('success');
    if (disabled) accept.disabled();
    container.add(new ActionRow(accept));
  }

  return container;
}

/** Builds the initial `/legal` viewer (privacy tab), for the first reply. */
export function buildLegalViewerContainer(acceptedAt: Date | null): Container {
  return renderViewer({ document: 'privacy', acceptedAt }, false);
}

/**
 * Drives the `/legal` viewer: tab buttons switch between the privacy policy and
 * the terms of service, and the accept button records the user's acceptance.
 * Restricted to `userId`.
 */
export function attachLegalViewer(
  message: Message,
  userId: string,
  acceptedAt: Date | null,
): void {
  new InteractiveMessage<LegalViewState>(
    message,
    { document: 'privacy', acceptedAt },
    (state, { disabled }) => renderViewer(state, disabled),
    async (interaction, state) => {
      if (!interaction.isButton()) return state;
      if (interaction.customId === PRIVACY_BUTTON_ID) {
        return { ...state, document: 'privacy' };
      }
      if (interaction.customId === TERMS_BUTTON_ID) {
        return { ...state, document: 'terms' };
      }
      if (interaction.customId === ACCEPT_BUTTON_ID && !state.acceptedAt) {
        await acceptLegal(userId);
        return { ...state, acceptedAt: new Date() };
      }
      return state;
    },
    { idle: VIEWER_IDLE_MS, allowedIds: [userId] },
  );
}

/** State of the acceptance gate prompt: whether the user has accepted yet. */
interface GateState {
  accepted: boolean;
}

function renderGate(state: GateState, disabled: boolean): Container {
  if (state.accepted) {
    return new Container().color('success').add(new Text(m.gate.accepted));
  }

  const accept = new Button(ACCEPT_BUTTON_ID)
    .label(m.gate.acceptButton)
    .color('success');
  if (disabled) accept.disabled();

  return new Container()
    .color('warning')
    .add(new Title(m.gate.title), new Text(m.gate.body), new ActionRow(accept));
}

/** Builds the initial acceptance-gate prompt shown to a blocked user. */
export function buildLegalGateContainer(): Container {
  return renderGate({ accepted: false }, false);
}

/**
 * Attaches the accept-button collector to a gate prompt. Clicking records the
 * acceptance and re-renders a confirmation. Restricted to `userId`.
 */
export function attachLegalGate(message: Message, userId: string): void {
  new InteractiveMessage<GateState>(
    message,
    { accepted: false },
    (state, { disabled }) => renderGate(state, disabled),
    async (interaction, state, { stop }) => {
      if (
        !interaction.isButton() ||
        interaction.customId !== ACCEPT_BUTTON_ID
      ) {
        return state;
      }
      await acceptLegal(userId);
      stop();
      return { ...state, accepted: true };
    },
    { idle: GATE_IDLE_MS, allowedIds: [userId] },
  );
}
