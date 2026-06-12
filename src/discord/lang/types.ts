type MessageValue = string | ((...args: any[]) => string) | MessageObject;

interface MessageObject {
  [key: string]: MessageValue;
}

export interface CommandLang {
  commandDescription: string;
  messages: MessageObject;
  [key: string]: unknown;
}
