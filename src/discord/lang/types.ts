type MessageValue = string | ((...args: never[]) => string) | MessageObject;

interface MessageObject {
  [key: string]: MessageValue;
}

/**
 * Lang module shape required for a command to appear in `/help`.
 *
 * `messages` may nest objects arbitrarily, but every leaf must be a
 * string or a formatter function - see {@link MessageValue}.
 */
export interface CommandLang {
  /** Shown as the command's description in the `/help` select menu. */
  commandDescription: string;
  messages: MessageObject;
  [key: string]: unknown;
}
