import { eq, desc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const MAX_MESSAGE_LENGTH = 250;
const MAX_MESSAGES_RETURNED = 50;

// ─── Get Messages ───────────────────────────────────────────────────────────

export function getMessages(limit: number = MAX_MESSAGES_RETURNED) {
  const messages = db.select().from(schema.chatMessages)
    .orderBy(desc(schema.chatMessages.id))
    .limit(limit)
    .all();

  // Return in chronological order (oldest first)
  return messages.reverse().map(m => ({
    id: m.id,
    userId: m.userId,
    username: m.username,
    message: m.message,
    createdAt: m.createdAt,
  }));
}

// ─── Send Message ───────────────────────────────────────────────────────────

export function sendMessage(userId: number, message: string) {
  // Validate message
  const trimmed = message.trim();
  if (!trimmed) throw new Error('Message cannot be empty');
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters.`);
  }

  // Get user info
  const user = db.select().from(schema.users)
    .where(eq(schema.users.id, userId)).get();
  if (!user) throw new Error('User not found');

  // Get character name (use character name if they have one, otherwise username)
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  const displayName = char?.name || user.username;

  // Handle /me emote command
  let finalMessage = trimmed;
  let isEmote = false;
  if (trimmed.startsWith('/me ')) {
    finalMessage = trimmed.substring(4);
    isEmote = true;
  }

  // Sanitize (strip HTML tags)
  finalMessage = finalMessage.replace(/<[^>]*>/g, '');

  // Insert message
  const result = db.insert(schema.chatMessages).values({
    userId,
    username: displayName,
    message: isEmote ? `* ${displayName} ${finalMessage}` : finalMessage,
    createdAt: new Date().toISOString(),
  }).run();

  return {
    id: Number(result.lastInsertRowid),
    userId,
    username: displayName,
    message: isEmote ? `* ${displayName} ${finalMessage}` : finalMessage,
    createdAt: new Date().toISOString(),
    isEmote,
  };
}

// ─── Get Messages Since (for polling) ───────────────────────────────────────

export function getMessagesSince(afterId: number) {
  // Get all messages with id > afterId
  const allMessages = db.select().from(schema.chatMessages)
    .orderBy(desc(schema.chatMessages.id))
    .limit(MAX_MESSAGES_RETURNED)
    .all();

  return allMessages
    .filter(m => m.id > afterId)
    .reverse()
    .map(m => ({
      id: m.id,
      userId: m.userId,
      username: m.username,
      message: m.message,
      createdAt: m.createdAt,
    }));
}
