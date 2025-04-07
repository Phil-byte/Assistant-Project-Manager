// src/lib/tasks.ts
import { getDatabase } from './db';

export interface Task {
  id: number;
  title: string;
  project_id: number;
  description?: string;
  status: 'to_do' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: number;
  start_date?: string;
  due_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  project_id: number;
  description?: string;
  status: 'to_do' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: number;
  start_date?: string;
  due_date?: string;
  created_by: number;
}

export interface UpdateTaskData {
  title?: string;
  project_id?: number;
  description?: string;
  status?: 'to_do' | 'in_progress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: number;
  start_date?: string;
  due_date?: string;
}

/**
 * Récupère toutes les tâches
 */
export async function getAllTasks(env: any): Promise<Task[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM tasks ORDER BY due_date ASC');
}

/**
 * Récupère les tâches d'un projet spécifique
 */
export async function getTasksByProjectId(env: any, projectId: number): Promise<Task[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM tasks WHERE project_id = ? ORDER BY due_date ASC', [projectId]);
}

/**
 * Récupère les tâches assignées à un utilisateur spécifique
 */
export async function getTasksByAssignedTo(env: any, userId: number): Promise<Task[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC', [userId]);
}

/**
 * Récupère une tâche par son ID
 */
export async function getTaskById(env: any, id: number): Promise<Task | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
}

/**
 * Crée une nouvelle tâche
 */
export async function createTask(env: any, data: CreateTaskData): Promise<number> {
  const db = getDatabase(env);
  
  const { title, project_id, description, status, priority, assigned_to, start_date, due_date, created_by } = data;
  
  return db.insert(
    'INSERT INTO tasks (title, project_id, description, status, priority, assigned_to, start_date, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, project_id, description || null, status, priority, assigned_to || null, start_date || null, due_date || null, created_by]
  );
}

/**
 * Met à jour une tâche existante
 */
export async function updateTask(env: any, id: number, data: UpdateTaskData): Promise<boolean> {
  const db = getDatabase(env);
  
  // Construction dynamique de la requête de mise à jour
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  
  if (data.project_id !== undefined) {
    updates.push('project_id = ?');
    values.push(data.project_id);
  }
  
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    values.push(data.priority);
  }
  
  if (data.assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    values.push(data.assigned_to);
  }
  
  if (data.start_date !== undefined) {
    updates.push('start_date = ?');
    values.push(data.start_date);
  }
  
  if (data.due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(data.due_date);
  }
  
  // Ajout de la mise à jour du timestamp
  updates.push('updated_at = CURRENT_TIMESTAMP');
  
  // Si aucune donnée à mettre à jour, retourner false
  if (updates.length === 1) {
    return false;
  }
  
  // Ajout de l'ID à la fin des valeurs
  values.push(id);
  
  const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
  const result = await db.update(query, values);
  
  return result > 0;
}

/**
 * Supprime une tâche
 */
export async function deleteTask(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM tasks WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Recherche des tâches par titre
 */
export async function searchTasks(env: any, query: string): Promise<Task[]> {
  const db = getDatabase(env);
  const searchQuery = `%${query}%`;
  return db.query(
    'SELECT * FROM tasks WHERE title LIKE ? ORDER BY due_date ASC',
    [searchQuery]
  );
}

/**
 * Récupère les tâches par statut
 */
export async function getTasksByStatus(env: any, status: 'to_do' | 'in_progress' | 'review' | 'completed'): Promise<Task[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM tasks WHERE status = ? ORDER BY due_date ASC', [status]);
}

/**
 * Récupère les tâches par priorité
 */
export async function getTasksByPriority(env: any, priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM tasks WHERE priority = ? ORDER BY due_date ASC', [priority]);
}

/**
 * Récupère les tâches à échéance proche (dans les prochains jours)
 */
export async function getUpcomingTasks(env: any, days: number): Promise<Task[]> {
  const db = getDatabase(env);
  return db.query(
    `SELECT * FROM tasks 
     WHERE due_date IS NOT NULL 
     AND due_date <= date('now', '+' || ? || ' days') 
     AND status != 'completed' 
     ORDER BY due_date ASC`,
    [days]
  );
}
