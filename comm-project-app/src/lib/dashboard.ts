// src/lib/dashboard.ts
import { getDatabase } from './db';

/**
 * Récupère le nombre total de projets par statut
 */
export async function getProjectCountByStatus(env: any): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT status, COUNT(*) as count 
    FROM projects 
    GROUP BY status 
    ORDER BY count DESC
  `);
}

/**
 * Récupère le nombre total de tâches par statut
 */
export async function getTaskCountByStatus(env: any): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT status, COUNT(*) as count 
    FROM tasks 
    GROUP BY status 
    ORDER BY count DESC
  `);
}

/**
 * Récupère le nombre total de tâches par priorité
 */
export async function getTaskCountByPriority(env: any): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT priority, COUNT(*) as count 
    FROM tasks 
    GROUP BY priority 
    ORDER BY count DESC
  `);
}

/**
 * Récupère les projets à venir avec échéance proche
 */
export async function getUpcomingProjects(env: any, days: number = 14): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT p.*, c.name as client_name 
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    WHERE p.due_date IS NOT NULL 
    AND p.due_date <= date('now', '+' || ? || ' days') 
    AND p.status NOT IN ('completed', 'cancelled')
    ORDER BY p.due_date ASC
    LIMIT 5
  `, [days]);
}

/**
 * Récupère les tâches en retard
 */
export async function getOverdueTasks(env: any): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT t.*, p.title as project_title 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.due_date < date('now') 
    AND t.status != 'completed'
    ORDER BY t.due_date ASC
    LIMIT 10
  `);
}

/**
 * Récupère les tâches récemment terminées
 */
export async function getRecentlyCompletedTasks(env: any, limit: number = 5): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT t.*, p.title as project_title, u.first_name, u.last_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.status = 'completed'
    ORDER BY t.updated_at DESC
    LIMIT ?
  `, [limit]);
}

/**
 * Récupère le nombre de projets par client
 */
export async function getProjectCountByClient(env: any): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT c.id, c.name, COUNT(p.id) as project_count
    FROM clients c
    LEFT JOIN projects p ON c.id = p.client_id
    GROUP BY c.id
    ORDER BY project_count DESC
    LIMIT 5
  `);
}

/**
 * Récupère les activités récentes
 */
export async function getRecentActivities(env: any, limit: number = 10): Promise<any[]> {
  const db = getDatabase(env);
  return db.query(`
    SELECT al.*, u.first_name, u.last_name
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT ?
  `, [limit]);
}

/**
 * Récupère les statistiques globales
 */
export async function getGlobalStats(env: any): Promise<any> {
  const db = getDatabase(env);
  
  const clientCount = await db.queryOne('SELECT COUNT(*) as count FROM clients');
  const projectCount = await db.queryOne('SELECT COUNT(*) as count FROM projects');
  const activeProjectCount = await db.queryOne("SELECT COUNT(*) as count FROM projects WHERE status IN ('planning', 'in_progress')");
  const taskCount = await db.queryOne('SELECT COUNT(*) as count FROM tasks');
  const pendingTaskCount = await db.queryOne("SELECT COUNT(*) as count FROM tasks WHERE status != 'completed'");
  const pendingApprovalCount = await db.queryOne("SELECT COUNT(*) as count FROM approvals WHERE status = 'pending'");
  
  return {
    clientCount: clientCount.count,
    projectCount: projectCount.count,
    activeProjectCount: activeProjectCount.count,
    taskCount: taskCount.count,
    pendingTaskCount: pendingTaskCount.count,
    pendingApprovalCount: pendingApprovalCount.count
  };
}
