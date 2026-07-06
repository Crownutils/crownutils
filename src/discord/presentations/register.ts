import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../components/index.js';
import {
  Button,
  ButtonActionRow,
  createContainer,
  Separator,
  Text,
} from '../components/index.js';
import { lang } from '../lang/index.js';
import type { LegalDocument } from '../usecases/index.js';

/** Custom ids of the legal viewer's buttons, matched in the register controller's `reduce`. */
export const LEGAL_VIEW_CGU_ID = 'register-legal-view-cgu';
export const LEGAL_VIEW_PRIVACY_ID = 'register-legal-view-privacy';
export const LEGAL_ACCEPT_ID = 'register-legal-accept';
export const LEGAL_DECLINE_ID = 'register-legal-declined';

/**
 * Render one legal document (terms or privacy) with buttons to switch between
 * the two. When `isRegistration`, appends accept/decline buttons. The `legal`
 * command reuses this with `isRegistration = false` and its own `viewIds`, so
 * its toggle buttons stay distinct from the register flow's.
 */
export function buildLegalContainer(
  language: SupportedLocale,
  document: LegalDocument,
  disabled: boolean,
  isRegistration = true,
  viewIds: { readonly cgu: string; readonly privacy: string } = {
    cgu: LEGAL_VIEW_CGU_ID,
    privacy: LEGAL_VIEW_PRIVACY_ID,
  },
): Container {
  const legalMessages = lang[language].legal;
  const isPrivacy = document === 'privacy';
  const chapters: readonly { heading: string; body: string }[] = Object.values(
    isPrivacy ? legalMessages.documents.privacy : legalMessages.documents.terms,
  );

  const container = createContainer('brand').add(
    new Text(
      isPrivacy ? legalMessages.privacyTitle : legalMessages.cguTitle,
    ).title(),
    new Text(legalMessages.intro).size('subtle'),
  );

  chapters.forEach((chapter, index) => {
    container.add(
      new Separator(),
      new Text(`${index + 1}. ${chapter.heading}`).size('small'),
      new Text(chapter.body),
    );
  });

  container.add(
    new Separator(),
    new ButtonActionRow().add(
      new Button(viewIds.cgu)
        .label(legalMessages.cguButtonLabel)
        .color(isPrivacy ? 'secondary' : 'primary')
        .disabled(!isPrivacy || disabled),
      new Button(viewIds.privacy)
        .label(legalMessages.privacyButtonLabel)
        .color(isPrivacy ? 'primary' : 'secondary')
        .disabled(isPrivacy || disabled),
    ),
  );

  if (isRegistration) {
    const registerMessages = lang[language].commandRegister.messages;
    container.add(
      new ButtonActionRow().add(
        new Button(LEGAL_ACCEPT_ID)
          .label(registerMessages.acceptButtonLabel)
          .color('success')
          .disabled(disabled),
        new Button(LEGAL_DECLINE_ID)
          .label(registerMessages.declineButtonLabel)
          .color('danger')
          .disabled(disabled),
      ),
    );
  }

  return container;
}

/** Terminal screen shown once the user accepts and their account is created. */
export function buildRegisterDoneContainer(
  language: SupportedLocale,
): Container {
  const messages = lang[language].commandRegister.messages;
  return createContainer('success').add(
    new Text(messages.doneTitle).title(),
    new Separator(),
    new Text(messages.doneBody),
  );
}

/** Terminal screen shown once the user declines the legal documents. */
export function buildRegisterCancelledContainer(
  language: SupportedLocale,
): Container {
  const messages = lang[language].commandRegister.messages;
  return createContainer('cancel').add(
    new Text(messages.cancelledTitle).title(),
    new Separator(),
    new Text(messages.cancelledBody),
  );
}

/** Shown when an already-registered user runs the command: their accepted version and date. */
export function buildRegisterAlreadyContainer(
  language: SupportedLocale,
  version: string,
  acceptedAt: Date,
): Container {
  const messages = lang[language].commandRegister.messages;
  const when = new Intl.DateTimeFormat(language, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(acceptedAt);
  return createContainer('warn').add(
    new Text(messages.alreadyTitle).title(),
    new Separator(),
    new Text(messages.alreadyBody(version, when)),
  );
}

export function buildRegisterCannotRegisterContainer(
  language: SupportedLocale,
) {
  const messages = lang[language].commandRegister.messages;
  return createContainer('cancel').add(new Text(messages.cannotRegister));
}
