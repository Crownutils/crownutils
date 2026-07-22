/**
 * Shape constraint for language packs: every leaf is a plain string or a
 * formatter that returns a string. Applied with `as const satisfies LangNode`,
 * so each pack keeps its precise literal type while the invariant "no leaf is
 * anything but a string or a string formatter" is enforced at compile time.
 */
export type LangLeaf = string | ((...args: never[]) => string);

/** A nested tree whose every leaf is a {@link LangLeaf}. */
export interface LangNode {
  readonly [key: string]: LangLeaf | LangNode;
}

/** Language node of one command: its description plus its own strings. */
export interface CommandNode {
  description: string;
  /** Command-specific strings; omit for commands whose content lives in a shared node. */
  messages?: LangLeaf | LangNode;
  readonly [key: string]: LangLeaf | LangNode;
}
