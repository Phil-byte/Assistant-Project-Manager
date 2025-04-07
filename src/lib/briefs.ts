// src/lib/briefs.ts
import { getDatabase } from './db';

export interface Brief {
  id: number;
  title: string;
  client_id: number;
  description?: string;
  requirements?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBriefData {
  title: string;
  client_id: number;
  description?: string;
  requirements?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_by: number;
}

export interface UpdateBriefData {
  title?: string;
  client_id?: number;
  description?: string;
  requirements?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

/**
 * Récupère tous les briefs
 */
export async function getAllBriefs(env: any): Promise<Brief[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM briefs ORDER BY created_at DESC');
}

/**
 * Récupère les briefs d'un client spécifique
 */
export async function getBriefsByClientId(env: any, clientId: number): Promise<Brief[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM briefs WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
}

/**
 * Récupère un brief par son ID
 */
export async function getBriefById(env: any, id: number): Promise<Brief | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM briefs WHERE id = ?', [id]);
}

/**
 * Crée un nouveau brief
 */
export async function createBrief(env: any, data: CreateBriefData): Promise<number> {
  const db = getDatabase(env);
  
  const { title, client_id, description, requirements, status, created_by } = data;
  
  return db.insert(
    'INSERT INTO briefs (title, client_id, description, requirements, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title, client_id, description || null, requirements || null, status, created_by]
  );
}

/**
 * Met à jour un brief existant
 */
export async function updateBrief(env: any, id: number, data: UpdateBriefData): Promise<boolean> {
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
  
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  
  if (data.requirements !== undefined) {
    updates.push('requirements = ?');
    values.push(data.requirements);
  }
  
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  
  // Ajout de la mise à jour du timestamp
  updates.push('updated_at = CURRENT_TIMESTAMP');
  
  // Si aucune donnée à mettre à jour, retourner false
  if (updates.length === 1) {
    return false;
  }
  
  // Ajout de l'ID à la fin des valeurs
  values.push(id);
  
  const query = `UPDATE briefs SET ${updates.join(', ')} WHERE id = ?`;
  const result = await db.update(query, values);
  
  return result > 0;
}

/**
 * Supprime un brief
 */
export async function deleteBrief(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM briefs WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Recherche des briefs par titre
 */
export async function searchBriefs(env: any, query: string): Promise<Brief[]> {
  const db = getDatabase(env);
  const searchQuery = `%${query}%`;
  return db.query(
    'SELECT * FROM briefs WHERE title LIKE ? ORDER BY created_at DESC',
    [searchQuery]
  );
}
