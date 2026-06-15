/**
 * Builds and parses Discord component custom ids as `ctx|id` pairs, so a
 * collector can recover both the context and target id from a click.
 */
export class CustomId<C extends string> {
  private static readonly SEPARATOR = '|';

  public readonly value: string;

  public constructor(
    private readonly ctx: C,
    private readonly id: string,
  ) {
    this.value = `${ctx}${CustomId.SEPARATOR}${id}`;
  }

  /** Splits a custom id back into its `ctx` and `id`, or `null` if malformed. */
  public static parse(customId: string): { ctx: string; id: string } | null {
    const [ctx, id] = customId.split(CustomId.SEPARATOR);
    if (ctx === undefined || id === undefined) {
      return null;
    }
    return { ctx, id };
  }
}
