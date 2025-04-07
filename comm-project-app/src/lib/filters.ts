// src/lib/filters.ts
import { getDatabase } from './db';

/**
 * Interface pour les options de filtrage
 */
export interface FilterOptions {
  search?: string;
  status?: string[];
  priority?: string[];
  startDate?: string;
  endDate?: string;
  assignedTo?: number[];
  tags?: number[];
  clientId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Filtre les projets selon les critères spécifiés
 */
export async function filterProjects(env: any, options: FilterOptions): Promise<any[]> {
  const db = getDatabase(env);
  
  let query = `
    SELECT p.*, c.name as client_name, u.first_name as manager_first_name, u.last_name as manager_last_name
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    JOIN users u ON p.manager_id = u.id
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  // Filtrage par recherche textuelle
  if (options.search) {
    conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
    params.push(`%${options.search}%`, `%${options.search}%`);
  }
  
  // Filtrage par statut
  if (options.status && options.status.length > 0) {
    const placeholders = options.status.map(() => '?').join(', ');
    conditions.push(`p.status IN (${placeholders})`);
    params.push(...options.status);
  }
  
  // Filtrage par date de début
  if (options.startDate) {
    conditions.push('p.start_date >= ?');
    params.push(options.startDate);
  }
  
  // Filtrage par date d'échéance
  if (options.endDate) {
    conditions.push('p.due_date <= ?');
    params.push(options.endDate);
  }
  
  // Filtrage par client
  if (options.clientId) {
    conditions.push('p.client_id = ?');
    params.push(options.clientId);
  }
  
  // Filtrage par tags
  if (options.tags && options.tags.length > 0) {
    query += `
      JOIN (
        SELECT DISTINCT project_id 
        FROM tag_items 
        WHERE tag_id IN (${options.tags.map(() => '?').join(', ')})
      ) ti ON p.id = ti.project_id
    `;
    params.push(...options.tags);
  }
  
  // Ajout des conditions à la requête
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  // Tri des résultats
  if (options.sortBy) {
    const sortField = getSortField('project', options.sortBy);
    const sortOrder = options.sortOrder || 'asc';
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY p.due_date ASC';
  }
  
  // Pagination
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return db.query(query, params);
}

/**
 * Filtre les tâches selon les critères spécifiés
 */
export async function filterTasks(env: any, options: FilterOptions): Promise<any[]> {
  const db = getDatabase(env);
  
  let query = `
    SELECT t.*, p.title as project_title, u.first_name, u.last_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  // Filtrage par recherche textuelle
  if (options.search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
    params.push(`%${options.search}%`, `%${options.search}%`);
  }
  
  // Filtrage par statut
  if (options.status && options.status.length > 0) {
    const placeholders = options.status.map(() => '?').join(', ');
    conditions.push(`t.status IN (${placeholders})`);
    params.push(...options.status);
  }
  
  // Filtrage par priorité
  if (options.priority && options.priority.length > 0) {
    const placeholders = options.priority.map(() => '?').join(', ');
    conditions.push(`t.priority IN (${placeholders})`);
    params.push(...options.priority);
  }
  
  // Filtrage par date de début
  if (options.startDate) {
    conditions.push('t.start_date >= ?');
    params.push(options.startDate);
  }
  
  // Filtrage par date d'échéance
  if (options.endDate) {
    conditions.push('t.due_date <= ?');
    params.push(options.endDate);
  }
  
  // Filtrage par assignation
  if (options.assignedTo && options.assignedTo.length > 0) {
    const placeholders = options.assignedTo.map(() => '?').join(', ');
    conditions.push(`t.assigned_to IN (${placeholders})`);
    params.push(...options.assignedTo);
  }
  
  // Filtrage par tags
  if (options.tags && options.tags.length > 0) {
    query += `
      JOIN (
        SELECT DISTINCT task_id 
        FROM tag_items 
        WHERE tag_id IN (${options.tags.map(() => '?').join(', ')})
      ) ti ON t.id = ti.task_id
    `;
    params.push(...options.tags);
  }
  
  // Ajout des conditions à la requête
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  // Tri des résultats
  if (options.sortBy) {
    const sortField = getSortField('task', options.sortBy);
    const sortOrder = options.sortOrder || 'asc';
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY t.due_date ASC';
  }
  
  // Pagination
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return db.query(query, params);
}

/**
 * Filtre les clients selon les critères spécifiés
 */
export async function filterClients(env: any, options: FilterOptions): Promise<any[]> {
  const db = getDatabase(env);
  
  let query = `
    SELECT c.*
    FROM clients c
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  // Filtrage par recherche textuelle
  if (options.search) {
    conditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.department LIKE ?)');
    params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
  }
  
  // Filtrage par tags
  if (options.tags && options.tags.length > 0) {
    query += `
      JOIN (
        SELECT DISTINCT client_id 
        FROM tag_items 
        WHERE tag_id IN (${options.tags.map(() => '?').join(', ')})
      ) ti ON c.id = ti.client_id
    `;
    params.push(...options.tags);
  }
  
  // Ajout des conditions à la requête
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  // Tri des résultats
  if (options.sortBy) {
    const sortField = getSortField('client', options.sortBy);
    const sortOrder = options.sortOrder || 'asc';
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY c.name ASC';
  }
  
  // Pagination
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return db.query(query, params);
}

/**
 * Filtre les briefs selon les critères spécifiés
 */
export async function filterBriefs(env: any, options: FilterOptions): Promise<any[]> {
  const db = getDatabase(env);
  
  let query = `
    SELECT b.*, c.name as client_name, u.first_name, u.last_name
    FROM briefs b
    JOIN clients c ON b.client_id = c.id
    JOIN users u ON b.created_by = u.id
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  // Filtrage par recherche textuelle
  if (options.search) {
    conditions.push('(b.title LIKE ? OR b.description LIKE ? OR b.requirements LIKE ?)');
    params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
  }
  
  // Filtrage par statut
  if (options.status && options.status.length > 0) {
    const placeholders = options.status.map(() => '?').join(', ');
    conditions.push(`b.status IN (${placeholders})`);
    params.push(...options.status);
  }
  
  // Filtrage par client
  if (options.clientId) {
    conditions.push('b.client_id = ?');
    params.push(options.clientId);
  }
  
  // Filtrage par tags
  if (options.tags && options.tags.length > 0) {
    query += `
      JOIN (
        SELECT DISTINCT brief_id 
        FROM tag_items 
        WHERE tag_id IN (${options.tags.map(() => '?').join(', ')})
      ) ti ON b.id = ti.brief_id
    `;
    params.push(...options.tags);
  }
  
  // Ajout des conditions à la requête
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  // Tri des résultats
  if (options.sortBy) {
    const sortField = getSortField('brief', options.sortBy);
    const sortOrder = options.sortOrder || 'asc';
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY b.created_at DESC';
  }
  
  // Pagination
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return db.query(query, params);
}

/**
 * Fonction utilitaire pour obtenir le nom du champ de tri
 */
function getSortField(entityType: string, sortBy: string): string {
  // Mapping des noms de champs pour le tri
  const fieldMappings: Record<string, Record<string, string>> = {
    project: {
      title: 'p.title',
      client: 'c.name',
      status: 'p.status',
      dueDate: 'p.due_date',
      startDate: 'p.start_date',
      manager: 'u.last_name',
      createdAt: 'p.created_at',
      updatedAt: 'p.updated_at'
    },
    task: {
      title: 't.title',
      project: 'p.title',
      status: 't.status',
      priority: 't.priority',
      dueDate: 't.due_date',
      assignee: 'u.last_name',
      createdAt: 't.created_at',
      updatedAt: 't.updated_at'
    },
    client: {
      name: 'c.name',
      email: 'c.email',
      department: 'c.department',
      createdAt: 'c.created_at',
      updatedAt: 'c.updated_at'
    },
    brief: {
      title: 'b.title',
      client: 'c.name',
      status: 'b.status',
      createdBy: 'u.last_name',
      createdAt: 'b.created_at',
      updatedAt: 'b.updated_at'
    }
  };
  
  // Retourner le champ mappé ou le champ par défaut
  return fieldMappings[entityType][sortBy] || `${entityType.charAt(0)}.created_at`;
}
