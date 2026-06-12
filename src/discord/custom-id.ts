type CustomIdSeparator = string;

export class CustomId<C extends string> {
  private static readonly SEPARATOR: CustomIdSeparator = '|';

  public readonly value: string;

  public constructor(
    private readonly ctx: C,
    private readonly id: string,
  ) {
    this.value = `${ctx}${CustomId.SEPARATOR}${id}`;
  }

  public static parse(customId: string): { ctx: string; id: string } | null {
    const [ctx, id] = customId.split(CustomId.SEPARATOR);
    if (ctx === undefined || id === undefined) {
      return null;
    }
    return { ctx, id };
  }
}
