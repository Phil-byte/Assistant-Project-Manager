// src/lib/tags.ts
import { getDatabase } from './db';

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_by: number;
  created_at: string;
}

export interface CreateTagData {
  name: string;
  color: string;
  created_by: number;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

/**
 * Récupère tous les tags
 */
export async function getAllTags(env: any): Promise<Tag[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM tags ORDER BY name ASC');
}

/**
 * Récupère un tag par son ID
 */
export async function getTagById(env: any, id: number): Promise<Tag | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM tags WHERE id = ?', [id]);
}

/**
 * Crée un nouveau tag
 */
export async function createTag(env: any, data: CreateTagData): Promise<number> {
  const db = getDatabase(env);
  
  const { name, color, created_by } = data;
  
  return db.insert(
    'INSERT INTO tags (name, color, created_by) VALUES (?, ?, ?)',
    [name, color, created_by]
  );
}

/**
 * Met à jour un tag existant
 */
export async function updateTag(env: any, id: number, data: UpdateTagData): Promise<boolean> {
  const db = getDatabase(env);
  
  // Construction dynamique de la requête de mise à jour
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  
  if (data.color !== undefined) {
    updates.push('color = ?');
    values.push(data.color);
  }
  
  // Si aucune donnée à mettre à jour, retourner false
  if (updates.length === 0) {
    return false;
  }
  
  // Ajout de l'ID à la fin des valeurs
  values.push(id);
  
  const query = `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`;
  const result = await db.update(query, values);
  
  return result > 0;
}

/**
 * Supprime un tag
 */
export async function deleteTag(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM tags WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Applique un tag à un élément (tâche, projet, brief ou client)
 */
export async function applyTag(env: any, tagId: number, entityType: 'task' | 'project' | 'brief' | 'client', entityId: number): Promise<boolean> {
  const db = getDatabase(env);
  
  // Déterminer quelle colonne mettre à jour en fonction du type d'entité
  let column = '';
  switch (entityType) {
    case 'task':
      column = 'task_id';
      break;
    case 'project':
      column = 'project_id';
      break;
    case 'brief':
      column = 'brief_id';
      break;
    case 'client':
      column = 'client_id';
      break;
    default:
      return false;
  }
  
  try {
    await db.insert(
      `INSERT INTO tag_items (tag_id, ${column}) VALUES (?, ?)`,
      [tagId, entityId]
    );
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'application du tag:', error);
    return false;
  }
}

/**
 * Supprime un tag d'un élément
 */
export async function removeTag(env: any, tagId: number, entityType: 'task' | 'project' | 'brief' | 'client', entityId: number): Promise<boolean> {
  const db = getDatabase(env);
  
  // Déterminer quelle colonne utiliser dans la condition WHERE
  let column = '';
  switch (entityType) {
    case 'task':
      column = 'task_id';
      break;
    case 'project':
      column = 'project_id';
      break;
    case 'brief':
      column = 'brief_id';
      break;
    case 'client':
      column = 'client_id';
      break;
    default:
      return false;
  }
  
  const result = await db.delete(
    `DELETE FROM tag_items WHERE tag_id = ? AND ${column} = ?`,
    [tagId, entityId]
  );
  
  return result > 0;
}

/**
 * Récupère tous les tags appliqués à un élément
 */
export async function getTagsByEntity(env: any, entityType: 'task' | 'project' | 'brief' | 'client', entityId: number): Promise<Tag[]> {
  const db = getDatabase(env);
  
  // Déterminer quelle colonne utiliser dans la condition WHERE
  let column = '';
  switch (entityType) {
    case 'task':
      column = 'task_id';
      break;
    case 'project':
      column = 'project_id';
      break;
    case 'brief':
      column = 'brief_id';
      break;
    case 'client':
      column = 'client_id';
      break;
    default:
      return [];
  }
  
  return db.query(
    `SELECT t.* FROM tags t
     JOIN tag_items ti ON t.id = ti.tag_id
     WHERE ti.${column} = ?
     ORDER BY t.name ASC`,
    [entityId]
  );
}
