// src/lib/projects.ts
import { getDatabase } from './db';

export interface Project {
  id: number;
  title: string;
  client_id: number;
  brief_id?: number;
  description?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  due_date?: string;
  manager_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  title: string;
  client_id: number;
  brief_id?: number;
  description?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  due_date?: string;
  manager_id: number;
}

export interface UpdateProjectData {
  title?: string;
  client_id?: number;
  brief_id?: number;
  description?: string;
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  due_date?: string;
  manager_id?: number;
}

/**
 * Récupère tous les projets
 */
export async function getAllProjects(env: any): Promise<Project[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM projects ORDER BY due_date ASC');
}

/**
 * Récupère les projets d'un client spécifique
 */
export async function getProjectsByClientId(env: any, clientId: number): Promise<Project[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM projects WHERE client_id = ? ORDER BY due_date ASC', [clientId]);
}

/**
 * Récupère les projets gérés par un utilisateur spécifique
 */
export async function getProjectsByManagerId(env: any, managerId: number): Promise<Project[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM projects WHERE manager_id = ? ORDER BY due_date ASC', [managerId]);
}

/**
 * Récupère un projet par son ID
 */
export async function getProjectById(env: any, id: number): Promise<Project | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM projects WHERE id = ?', [id]);
}

/**
 * Crée un nouveau projet
 */
export async function createProject(env: any, data: CreateProjectData): Promise<number> {
  const db = getDatabase(env);
  
  const { title, client_id, brief_id, description, status, start_date, due_date, manager_id } = data;
  
  return db.insert(
    'INSERT INTO projects (title, client_id, brief_id, description, status, start_date, due_date, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, client_id, brief_id || null, description || null, status, start_date || null, due_date || null, manager_id]
  );
}

/**
 * Met à jour un projet existant
 */
export async function updateProject(env: any, id: number, data: UpdateProjectData): Promise<boolean> {
  const db = getDatabase(env);
  
  // Construction dynamique de la requête de mise à jour
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  
  if (data.client_id !== undefined) {
    updates.push('client_id = ?');
    values.push(data.client_id);
  }
  
  if (data.brief_id !== undefined) {
    updates.push('brief_id = ?');
    values.push(data.brief_id);
  }
  
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  
  if (data.start_date !== undefined) {
    updates.push('start_date = ?');
    values.push(data.start_date);
  }
  
  if (data.due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(data.due_date);
  }
  
  if (data.manager_id !== undefined) {
    updates.push('manager_id = ?');
    values.push(data.manager_id);
  }
  
  // Ajout de la mise à jour du timestamp
  updates.push('updated_at = CURRENT_TIMESTAMP');
  
  // Si aucune donnée à mettre à jour, retourner false
  if (updates.length === 1) {
    return false;
  }
  
  // Ajout de l'ID à la fin des valeurs
  values.push(id);
  
  const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
  const result = await db.update(query, values);
  
  return result > 0;
}

/**
 * Supprime un projet
 */
export async function deleteProject(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM projects WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Recherche des projets par titre
 */
export async function searchProjects(env: any, query: string): Promise<Project[]> {
  const db = getDatabase(env);
  const searchQuery = `%${query}%`;
  return db.query(
    'SELECT * FROM projects WHERE title LIKE ? ORDER BY due_date ASC',
    [searchQuery]
  );
}

/**
 * Ajoute un membre à un projet
 */
export async function addProjectMember(env: any, projectId: number, userId: number, role: 'manager' | 'member' | 'client' | 'observer'): Promise<boolean> {
  const db = getDatabase(env);
  try {
    await db.insert(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, role]
    );
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un membre au projet:', error);
    return false;
  }
}

/**
 * Supprime un membre d'un projet
 */
export async function removeProjectMember(env: any, projectId: number, userId: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return result > 0;
}

/**
 * Récupère tous les membres d'un projet
 */
export async function getProjectMembers(env: any, projectId: number): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(
    `SELECT pm.*, u.first_name, u.last_name, u.email, u.role as user_role 
     FROM project_members pm
     JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = ?
     ORDER BY pm.role, u.last_name, u.first_name`,
    [projectId]
  );
}
