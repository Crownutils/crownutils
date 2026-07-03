/** Discord Markdown inline-formatting helpers. Single source for text styling. */
export const md = {
  code: (content: string): string => `\`${content}\``,
  bold: (content: string): string => `**${content}**`,
  italic: (content: string): string => `*${content}*`,
  underline: (content: string): string => `__${content}__`,
  strikethrough: (content: string): string => `~~${content}~~`,
  link: (label: string, url: string): string => `[${label}](${url})`,

  /** Prefixes every line with `> ` (blockquote). */
  quote: (content: string): string =>
    content
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n'),
} as const;
