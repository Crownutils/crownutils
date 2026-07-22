/**
 * A language-pack leaf: a plain string or a formatter returning one. Packs
 * apply it with `as const satisfies`, keeping their precise literal types.
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
