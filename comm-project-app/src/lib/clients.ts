// src/lib/clients.ts
import { getDatabase } from './db';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  logo_url?: string;
  department?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  logo_url?: string;
  department?: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  department?: string;
  notes?: string;
}

/**
 * Récupère tous les clients
 */
export async function getAllClients(env: any): Promise<Client[]> {
  const db = getDatabase(env);
  return db.query('SELECT * FROM clients ORDER BY name ASC');
}

/**
 * Récupère un client par son ID
 */
export async function getClientById(env: any, id: number): Promise<Client | null> {
  const db = getDatabase(env);
  return db.queryOne('SELECT * FROM clients WHERE id = ?', [id]);
}

/**
 * Crée un nouveau client
 */
export async function createClient(env: any, data: CreateClientData): Promise<number> {
  const db = getDatabase(env);
  
  const { name, email, phone, logo_url, department, notes } = data;
  
  return db.insert(
    'INSERT INTO clients (name, email, phone, logo_url, department, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone || null, logo_url || null, department || null, notes || null]
  );
}

/**
 * Met à jour un client existant
 */
export async function updateClient(env: any, id: number, data: UpdateClientData): Promise<boolean> {
  const db = getDatabase(env);
  
  // Construction dynamique de la requête de mise à jour
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email);
  }
  
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    values.push(data.phone);
  }
  
  if (data.logo_url !== undefined) {
    updates.push('logo_url = ?');
    values.push(data.logo_url);
  }
  
  if (data.department !== undefined) {
    updates.push('department = ?');
    values.push(data.department);
  }
  
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    values.push(data.notes);
  }
  
  // Ajout de la mise à jour du timestamp
  updates.push('updated_at = CURRENT_TIMESTAMP');
  
  // Si aucune donnée à mettre à jour, retourner false
  if (updates.length === 1) {
    return false;
  }
  
  // Ajout de l'ID à la fin des valeurs
  values.push(id);
  
  const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`;
  const result = await db.update(query, values);
  
  return result > 0;
}

/**
 * Supprime un client
 */
export async function deleteClient(env: any, id: number): Promise<boolean> {
  const db = getDatabase(env);
  const result = await db.delete('DELETE FROM clients WHERE id = ?', [id]);
  return result > 0;
}

/**
 * Recherche des clients par nom ou email
 */
export async function searchClients(env: any, query: string): Promise<Client[]> {
  const db = getDatabase(env);
  const searchQuery = `%${query}%`;
  return db.query(
    'SELECT * FROM clients WHERE name LIKE ? OR email LIKE ? ORDER BY name ASC',
    [searchQuery, searchQuery]
  );
}
