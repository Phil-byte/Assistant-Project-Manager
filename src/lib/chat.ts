// src/lib/chat.ts
import { getDatabase } from './db';

export interface ChatMessage {
  id: number;
  content: string;
  sender_id: number;
  project_id: number;
  created_at: string;
}

export interface CreateChatMessageData {
  content: string;
  sender_id: number;
  project_id: number;
}

/**
 * Récupère tous les messages d'un projet
 */
export async function getProjectMessages(env: any, projectId: number): Promise<ChatMessage[]> {
  const db = getDatabase(env);
  return db.query(
    'SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at ASC',
    [projectId]
  );
}

/**
 * Récupère les messages récents d'un projet
 */
export async function getRecentProjectMessages(env: any, projectId: number, limit: number = 50): Promise<ChatMessage[]> {
  const db = getDatabase(env);
  return db.query(
    'SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at DESC LIMIT ?',
    [projectId, limit]
  );
}

/**
 * Récupère un message par son ID
 */
export async function getChatMessageById(env: any, id: number): Promise<ChatMessage | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM chat_messages WHERE id = ?', [id]);
}

/**
 * Crée un nouveau message
 */
export async function createChatMessage(env: any, data: CreateChatMessageData): Promise<number> {
  const db = getDatabase(env);
  
  const { content, sender_id, project_id } = data;
  
  return db.insert(
    'INSERT INTO chat_messages (content, sender_id, project_id) VALUES (?, ?, ?)',
    [content, sender_id, project_id]
  );
}

/**
 * Supprime un message
 */
export async function deleteChatMessage(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM chat_messages WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Récupère les messages avec les informations de l'expéditeur
 */
export async function getProjectMessagesWithSender(env: any, projectId: number): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(
    `SELECT cm.*, u.first_name, u.last_name, u.email, u.avatar_url 
     FROM chat_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.project_id = ? 
     ORDER BY cm.created_at ASC`,
    [projectId]
  );
}
