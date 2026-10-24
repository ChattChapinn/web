/**
 * Message Service
 * Handles message formatting and processing
 */

import moment from 'moment-timezone';
import { FormattedMessage } from '../types';
import { config } from '../config';

export interface MessageOptions {
  timezone?: string;
  format?: string;
  avatar?: string;
  isPrivate?: boolean;
  recipient?: string;
  image?: string;
}

const DEFAULT_OPTIONS: Required<Omit<MessageOptions, 'avatar' | 'isPrivate' | 'recipient' | 'image'>> = {
  timezone: config.env.DEFAULT_TIMEZONE,
  format: 'h:mm a',
};

/**
 * Format a message with timestamp
 */
export function formatMessage(
  username: string,
  text: string,
  options: MessageOptions = {}
): FormattedMessage {
  const { timezone, format, avatar, isPrivate, recipient, image } = { ...DEFAULT_OPTIONS, ...options };
  
  return Object.freeze({
    username,
    text,
    time: moment().tz(timezone).format(format),
    avatar,
    isPrivate,
    recipient,
    image,
  });
}

/**
 * Create a system message from the bot
 */
export function createBotMessage(text: string): FormattedMessage {
  return formatMessage(config.app.botName, text, { avatar: '🤖' });
}

/**
 * Create a welcome message
 */
export function createWelcomeMessage(): FormattedMessage {
  return createBotMessage(`¡Te damos la bienvenida a ${config.app.name}!`);
}

/**
 * Create a user joined message
 */
export function createUserJoinedMessage(username: string): FormattedMessage {
  return createBotMessage(`¡${username} se ha unido al chat!`);
}

/**
 * Create a user left message
 */
export function createUserLeftMessage(username: string): FormattedMessage {
  return createBotMessage(`¡${username} ha salido del chat!`);
}

// Message service class for more complex scenarios
export class MessageService {
  private readonly options: MessageOptions;

  constructor(options: MessageOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  format(username: string, text: string, extraOptions: MessageOptions = {}): FormattedMessage {
    return formatMessage(username, text, { ...this.options, ...extraOptions });
  }

  botMessage(text: string): FormattedMessage {
    return this.format(config.app.botName, text, { avatar: '🤖' });
  }

  welcome(): FormattedMessage {
    return this.botMessage(`¡Te damos la bienvenida a ${config.app.name}!`);
  }

  userJoined(username: string): FormattedMessage {
    return this.botMessage(`¡${username} se ha unido al chat!`);
  }

  userLeft(username: string): FormattedMessage {
    return this.botMessage(`¡${username} ha salido del chat!`);
  }
}

// Export singleton instance
export const messageService = new MessageService();
