// src/lib/approvals.ts
import { getDatabase } from './db';

export interface Approval {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: number;
  approved_by?: number;
  task_id?: number;
  project_id?: number;
  brief_id?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApprovalData {
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: number;
  approved_by?: number;
  task_id?: number;
  project_id?: number;
  brief_id?: number;
  feedback?: string;
}

export interface UpdateApprovalData {
  title?: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  feedback?: string;
}

/**
 * Récupère toutes les demandes de validation
 */
export async function getAllApprovals(env: any): Promise<Approval[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM approvals ORDER BY created_at DESC');
}

/**
 * Récupère les demandes de validation par statut
 */
export async function getApprovalsByStatus(env: any, status: 'pending' | 'approved' | 'rejected'): Promise<Approval[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM approvals WHERE status = ? ORDER BY created_at DESC', [status]);
}

/**
 * Récupère les demandes de validation demandées par un utilisateur
 */
export async function getApprovalsByRequestedBy(env: any, userId: number): Promise<Approval[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM approvals WHERE requested_by = ? ORDER BY created_at DESC', [userId]);
}

/**
 * Récupère les demandes de validation approuvées par un utilisateur
 */
export async function getApprovalsByApprovedBy(env: any, userId: number): Promise<Approval[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM approvals WHERE approved_by = ? ORDER BY created_at DESC', [userId]);
}

/**
 * Récupère une demande de validation par son ID
 */
export async function getApprovalById(env: any, id: number): Promise<Approval | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM approvals WHERE id = ?', [id]);
}

/**
 * Crée une nouvelle demande de validation
 */
export async function createApproval(env: any, data: CreateApprovalData): Promise<number> {
  const db = getDatabase(env);
  
  const { title, description, status, requested_by, approved_by, task_id, project_id, brief_id, feedback } = data;
  
  // Vérifier que l'entité est valide (une seule entité doit être spécifiée)
  const entityCount = [task_id, project_id, brief_id].filter(id => id !== undefined).length;
  if (entityCount !== 1) {
    throw new Error('Une seule entité (tâche, projet ou brief) doit être spécifiée pour une demande de validation');
  }
  
  return db.insert(
    'INSERT INTO approvals (title, description, status, requested_by, approved_by, task_id, project_id, brief_id, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description || null, status, requested_by, approved_by || null, task_id || null, project_id || null, brief_id || null, feedback || null]
  );
}

/**
 * Met à jour une demande de validation existante
 */
export async function updateApproval(env: any, id: number, data: UpdateApprovalData): Promise<boolean> {
  const db = getDatabase(env);
  
  // Construction dynamique de la requête de mise à jour
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  
  if (data.approved_by !== undefined) {
    updates.push('approved_by = ?');
    values.push(data.approved_by);
  }
  
  if (data.feedback !== undefined) {
    updates.push('feedback = ?');
    values.push(data.feedback);
  }
  
  // Ajout de la mise à jour du timestamp
  updates.push('updated_at = CURRENT_TIMESTAMP');
  
  // Si aucune donnée à mettre à jour, retourner false
  if (updates.length === 1) {
    return false;
  }
  
  // Ajout de l'ID à la fin des valeurs
  values.push(id);
  
  const query = `UPDATE approvals SET ${updates.join(', ')} WHERE id = ?`;
  const result = await db.update(query, values);
  
  return result > 0;
}

/**
 * Approuve une demande de validation
 */
export async function approveRequest(env: any, id: number, approvedBy: number, feedback?: string): Promise<boolean> {
  return updateApproval(env, id, {
    status: 'approved',
    approved_by: approvedBy,
    feedback
  });
}

/**
 * Rejette une demande de validation
 */
export async function rejectRequest(env: any, id: number, approvedBy: number, feedback?: string): Promise<boolean> {
  return updateApproval(env, id, {
    status: 'rejected',
    approved_by: approvedBy,
    feedback
  });
}

/**
 * Supprime une demande de validation
 */
export async function deleteApproval(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM approvals WHERE id = ?', [id]);
  return result > 0;
}
