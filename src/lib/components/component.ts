import type {
  ContainerBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

/** The discriminated union of all V2 components.
 * "kind" is the discriminant: it tells Container which native
 * discord.js method to call when assembling the component.
 */
export type V2Component = TextComponent | SeparatorComponent | RawComponent;

export interface TextComponent {
  kind: 'text';
  toBuilder(): TextDisplayBuilder;
}

export interface SeparatorComponent {
  kind: 'separator';
  toBuilder(): SeparatorBuilder;
}

/** Escape hatch: wraps any native component the model doesn't cover
 * (sections, galleries, buttons...). "apply" adds it to the container
 *directly, since each native type needs its own add method.
 */
export interface RawComponent {
  kind: 'raw';
  apply(container: ContainerBuilder): void;
}
