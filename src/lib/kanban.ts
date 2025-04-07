// src/lib/kanban.ts
import { getDatabase } from './db';
import { Task } from './tasks';

/**
 * Interface pour les colonnes du tableau Kanban
 */
export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}

/**
 * Récupère les tâches organisées par statut pour l'affichage Kanban
 */
export async function getKanbanBoardByProject(env: any, projectId: number): Promise<KanbanColumn[]> {
  const db = getDatabase(env);
  
  // Récupérer toutes les tâches du projet
  const tasks = await db.query(`
    SELECT t.*, u.first_name, u.last_name 
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY t.priority DESC, t.due_date ASC
  `, [projectId]);
  
  // Organiser les tâches par statut
  const columns: KanbanColumn[] = [
    { id: 'to_do', title: 'À faire', tasks: [] },
    { id: 'in_progress', title: 'En cours', tasks: [] },
    { id: 'review', title: 'En révision', tasks: [] },
    { id: 'completed', title: 'Terminé', tasks: [] }
  ];
  
  // Répartir les tâches dans les colonnes appropriées
  tasks.forEach((task: Task) => {
    const column = columns.find(col => col.id === task.status);
    if (column) {
      column.tasks.push(task);
    }
  });
  
  return columns;
}

/**
 * Déplace une tâche d'une colonne à une autre
 */
export async function moveTaskToColumn(env: any, taskId: number, newStatus: 'to_do' | 'in_progress' | 'review' | 'completed'): Promise<boolean> {
  const db = getDatabase(env);
  
  const result = await db.update(
    'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newStatus, taskId]
  );
  
  return result > 0;
}

/**
 * Récupère les tâches organisées par priorité pour l'affichage Kanban alternatif
 */
export async function getKanbanBoardByPriority(env: any, projectId: number): Promise<KanbanColumn[]> {
  const db = getDatabase(env);
  
  // Récupérer toutes les tâches du projet
  const tasks = await db.query(`
    SELECT t.*, u.first_name, u.last_name 
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY t.status, t.due_date ASC
  `, [projectId]);
  
  // Organiser les tâches par priorité
  const columns: KanbanColumn[] = [
    { id: 'high', title: 'Priorité haute', tasks: [] },
    { id: 'medium', title: 'Priorité moyenne', tasks: [] },
    { id: 'low', title: 'Priorité basse', tasks: [] }
  ];
  
  // Répartir les tâches dans les colonnes appropriées
  tasks.forEach((task: Task) => {
    const column = columns.find(col => col.id === task.priority);
    if (column) {
      column.tasks.push(task);
    }
  });
  
  return columns;
}

/**
 * Récupère les tâches organisées par assignation pour l'affichage Kanban par membre
 */
export async function getKanbanBoardByAssignee(env: any, projectId: number): Promise<any[]> {
  const db = getDatabase(env);
  
  // Récupérer tous les membres du projet
  const members = await db.query(`
    SELECT u.id, u.first_name, u.last_name
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `, [projectId]);
  
  // Récupérer toutes les tâches du projet
  const tasks = await db.query(`
    SELECT t.*
    FROM tasks t
    WHERE t.project_id = ?
    ORDER BY t.status, t.priority DESC, t.due_date ASC
  `, [projectId]);
  
  // Créer une colonne pour les tâches non assignées
  const columns = [
    { id: 'unassigned', title: 'Non assigné', assignee: null, tasks: tasks.filter((t: Task) => !t.assigned_to) }
  ];
  
  // Créer une colonne pour chaque membre
  members.forEach((member: any) => {
    columns.push({
      id: `user_${member.id}`,
      title: `${member.first_name} ${member.last_name}`,
      assignee: member,
      tasks: tasks.filter((t: Task) => t.assigned_to === member.id)
    });
  });
  
  return columns;
}
