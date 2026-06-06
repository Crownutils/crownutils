import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export type CommandAuthorization = 'owner' | 'privileged' | 'public';
export type CommandScope = 'main_guild_only' | 'global' | 'everywhere';
export type CommandPermission = CommandScope | CommandAuthorization;

export const AUTHORIZATION_LEVELS = {
  owner: 3,
  privileged: 2,
  public: 1,
} as const;

export const SCOPE_LEVELS = {
  main_guild_only: 3,
  global: 2,
  everywhere: 1,
} as const;

export interface CommandRequirements {
  scope?: CommandScope;
  authorizations?: CommandAuthorization;
}

export interface CommandValidation {
  canBeExecuted: boolean;
  missing_permissions: CommandPermission[];
}

export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  requirements?: CommandRequirements;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface PrefixCommand {
  name: string;
  description: string;
  aliases?: string[];
  requirements?: CommandRequirements;
  execute(interaction: Message, args: string[]): Promise<void>;
}
