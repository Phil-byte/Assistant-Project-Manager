// src/lib/notifications.ts
import { getDatabase } from './db';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  type: 'task' | 'project' | 'brief' | 'comment' | 'approval' | 'deadline';
  reference_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: number;
  title: string;
  content: string;
  type: 'task' | 'project' | 'brief' | 'comment' | 'approval' | 'deadline';
  reference_id?: number;
}

/**
 * Récupère toutes les notifications d'un utilisateur
 */
export async function getUserNotifications(env: any, userId: number): Promise<Notification[]> {
  const db = getDatabase(env);
  return db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

/**
 * Récupère les notifications non lues d'un utilisateur
 */
export async function getUnreadNotifications(env: any, userId: number): Promise<Notification[]> {
  const db = getDatabase(env);
  return db.query(
    'SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC',
    [userId]
  );
}

/**
 * Récupère une notification par son ID
 */
export async function getNotificationById(env: any, id: number): Promise<Notification | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM notifications WHERE id = ?', [id]);
}

/**
 * Crée une nouvelle notification
 */
export async function createNotification(env: any, data: CreateNotificationData): Promise<number> {
  const db = getDatabase(env);
  
  const { user_id, title, content, type, reference_id } = data;
  
  return db.insert(
    'INSERT INTO notifications (user_id, title, content, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, 0)',
    [user_id, title, content, type, reference_id || null]
  );
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.update(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [id]
  );
  return result > 0;
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(env: any, userId: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.update(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [userId]
  );
  return result > 0;
}

/**
 * Supprime une notification
 */
export async function deleteNotification(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM notifications WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Supprime toutes les notifications d'un utilisateur
 */
export async function deleteAllUserNotifications(env: any, userId: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM notifications WHERE user_id = ?', [userId]);
  return result > 0;
}

/**
 * Crée une notification pour une tâche assignée
 */
export async function createTaskAssignmentNotification(env: any, taskId: number, taskTitle: string, assignedToUserId: number, assignedByUserId: number): Promise<number> {
  return createNotification(env, {
    user_id: assignedToUserId,
    title: 'Nouvelle tâche assignée',
    content: `La tâche "${taskTitle}" vous a été assignée.`,
    type: 'task',
    reference_id: taskId
  });
}

/**
 * Crée une notification pour une échéance proche
 */
export async function createDeadlineNotification(env: any, entityType: 'task' | 'project', entityId: number, entityTitle: string, userId: number, daysRemaining: number): Promise<number> {
  return createNotification(env, {
    user_id: userId,
    title: 'Échéance proche',
    content: `${entityType === 'task' ? 'La tâche' : 'Le projet'} "${entityTitle}" arrive à échéance dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}.`,
    type: 'deadline',
    reference_id: entityId
  });
}
