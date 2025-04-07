// src/lib/files.ts
import { getDatabase } from './db';

export interface File {
  id: number;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  task_id?: number;
  project_id?: number;
  brief_id?: number;
  client_id?: number;
  created_at: string;
}

export interface CreateFileData {
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  task_id?: number;
  project_id?: number;
  brief_id?: number;
  client_id?: number;
}

/**
 * Récupère tous les fichiers
 */
export async function getAllFiles(env: any): Promise<File[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM files ORDER BY created_at DESC');
}

/**
 * Récupère les fichiers d'une tâche
 */
export async function getTaskFiles(env: any, taskId: number): Promise<File[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM files WHERE task_id = ? ORDER BY created_at DESC', [taskId]);
}

/**
 * Récupère les fichiers d'un projet
 */
export async function getProjectFiles(env: any, projectId: number): Promise<File[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
}

/**
 * Récupère les fichiers d'un brief
 */
export async function getBriefFiles(env: any, briefId: number): Promise<File[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM files WHERE brief_id = ? ORDER BY created_at DESC', [briefId]);
}

/**
 * Récupère les fichiers d'un client
 */
export async function getClientFiles(env: any, clientId: number): Promise<File[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM files WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
}

/**
 * Récupère un fichier par son ID
 */
export async function getFileById(env: any, id: number): Promise<File | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM files WHERE id = ?', [id]);
}

/**
 * Crée un nouveau fichier
 */
export async function createFile(env: any, data: CreateFileData): Promise<number> {
  const db = getDatabase(env);
  
  const { name, file_path, file_type, file_size, uploaded_by, task_id, project_id, brief_id, client_id } = data;
  
  return db.insert(
    'INSERT INTO files (name, file_path, file_type, file_size, uploaded_by, task_id, project_id, brief_id, client_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, file_path, file_type, file_size, uploaded_by, task_id || null, project_id || null, brief_id || null, client_id || null]
  );
}

/**
 * Supprime un fichier
 */
export async function deleteFile(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM files WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Recherche des fichiers par nom
 */
export async function searchFiles(env: any, query: string): Promise<File[]> {
  const db = getDatabase(env);
  const searchQuery = `%${query}%`;
  return db.query(
    'SELECT * FROM files WHERE name LIKE ? ORDER BY created_at DESC',
    [searchQuery]
  );
}

/**
 * Récupère les fichiers par type
 */
export async function getFilesByType(env: any, fileType: string): Promise<File[]> {
  const db = getDatabase(env);
  return db.query(
    'SELECT * FROM files WHERE file_type = ? ORDER BY created_at DESC',
    [fileType]
  );
}
