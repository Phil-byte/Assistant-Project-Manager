// src/tests/tasks.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  getTasksByProjectId,
  getTasksByAssignedTo,
  searchTasks,
  getTasksByStatus,
  getTasksByPriority,
  getUpcomingTasks
} from '../lib/tasks';

// Mock de l'environnement et de la base de données
const mockDb = {
  queryOne: vi.fn(),
  query: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

vi.mock('../lib/db', () => ({
  getDatabase: () => mockDb
}));

describe('Gestion des tâches', () => {
  const mockEnv = { DB: {} };
  const mockTasks = [
    { 
      id: 1, 
      title: 'Create assets', 
      project_id: 1,
      description: 'Créer tous les éléments graphiques pour le site',
      status: 'in_progress',
      priority: 'high',
      assigned_to: 2,
      start_date: '2025-04-05',
      due_date: '2025-04-15',
      created_by: 2,
      created_at: '2025-04-01T10:00:00.000Z',
      updated_at: '2025-04-01T10:00:00.000Z'
    },
    { 
      id: 2, 
      title: 'Review content', 
      project_id: 1,
      description: 'Réviser le contenu du site',
      status: 'to_do',
      priority: 'medium',
      assigned_to: 3,
      start_date: '2025-04-10',
      due_date: '2025-04-20',
      created_by: 2,
      created_at: '2025-04-02T11:00:00.000Z',
      updated_at: '2025-04-02T11:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('devrait récupérer toutes les tâches', async () => {
      mockDb.query.mockResolvedValue(mockTasks);
      
      const result = await getAllTasks(mockEnv);
      
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY due_date ASC');
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('devrait récupérer une tâche par son ID', async () => {
      mockDb.queryOne.mockResolvedValue(mockTasks[0]);
      
      const result = await getTaskById(mockEnv, 1);
      
      expect(mockDb.queryOne).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = ?', [1]);
      expect(result).toEqual(mockTasks[0]);
    });

    it('devrait retourner null si la tâche n\'existe pas', async () => {
      mockDb.queryOne.mockResolvedValue(null);
      
      const result = await getTaskById(mockEnv, 999);
      
      expect(result).toBeNull();
    });
  });

  describe('getTasksByProjectId', () => {
    it('devrait récupérer les tâches d\'un projet', async () => {
      mockDb.query.mockResolvedValue(mockTasks);
      
      const result = await getTasksByProjectId(mockEnv, 1);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY due_date ASC', 
        [1]
      );
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTasksByAssignedTo', () => {
    it('devrait récupérer les tâches assignées à un utilisateur', async () => {
      mockDb.query.mockResolvedValue([mockTasks[0]]);
      
      const result = await getTasksByAssignedTo(mockEnv, 2);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC', 
        [2]
      );
      expect(result).toEqual([mockTasks[0]]);
    });
  });

  describe('createTask', () => {
    it('devrait créer une nouvelle tâche', async () => {
      const newTask = {
        title: 'New Task',
        project_id: 1,
        description: 'Description de la nouvelle tâche',
        status: 'to_do',
        priority: 'high',
        assigned_to: 3,
        start_date: '2025-04-15',
        due_date: '2025-04-25',
        created_by: 2
      };
      
      mockDb.insert.mockResolvedValue(3);
      
      const result = await createTask(mockEnv, newTask);
      
      expect(mockDb.insert).toHaveBeenCalledWith(
        'INSERT INTO tasks (title, project_id, description, status, priority, assigned_to, start_date, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['New Task', 1, 'Description de la nouvelle tâche', 'to_do', 'high', 3, '2025-04-15', '2025-04-25', 2]
      );
      expect(result).toBe(3);
    });
  });

  describe('updateTask', () => {
    it('devrait mettre à jour une tâche existante', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'review',
        priority: 'low'
      };
      
      mockDb.update.mockResolvedValue(1);
      
      const result = await updateTask(mockEnv, 1, updateData);
      
      expect(mockDb.update).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks SET'),
        expect.arrayContaining(['Updated Task', 'review', 'low', 1])
      );
      expect(result).toBe(true);
    });

    it('devrait retourner false si aucune mise à jour n\'est effectuée', async () => {
      const updateData = {};
      
      const result = await updateTask(mockEnv, 1, updateData);
      
      expect(mockDb.update).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('deleteTask', () => {
    it('devrait supprimer une tâche', async () => {
      mockDb.delete.mockResolvedValue(1);
      
      const result = await deleteTask(mockEnv, 1);
      
      expect(mockDb.delete).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = ?', [1]);
      expect(result).toBe(true);
    });

    it('devrait retourner false si la tâche n\'existe pas', async () => {
      mockDb.delete.mockResolvedValue(0);
      
      const result = await deleteTask(mockEnv, 999);
      
      expect(result).toBe(false);
    });
  });

  describe('searchTasks', () => {
    it('devrait rechercher des tâches par titre', async () => {
      mockDb.query.mockResolvedValue([mockTasks[0]]);
      
      const result = await searchTasks(mockEnv, 'assets');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE title LIKE ? ORDER BY due_date ASC',
        ['%assets%']
      );
      expect(result).toEqual([mockTasks[0]]);
    });
  });

  describe('getTasksByStatus', () => {
    it('devrait récupérer les tâches par statut', async () => {
      mockDb.query.mockResolvedValue([mockTasks[0]]);
      
      const result = await getTasksByStatus(mockEnv, 'in_progress');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE status = ? ORDER BY due_date ASC',
        ['in_progress']
      );
      expect(result).toEqual([mockTasks[0]]);
    });
  });

  describe('getTasksByPriority', () => {
    it('devrait récupérer les tâches par priorité', async () => {
      mockDb.query.mockResolvedValue([mockTasks[0]]);
      
      const result = await getTasksByPriority(mockEnv, 'high');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE priority = ? ORDER BY due_date ASC',
        ['high']
      );
      expect(result).toEqual([mockTasks[0]]);
    });
  });

  describe('getUpcomingTasks', () => {
    it('devrait récupérer les tâches à échéance proche', async () => {
      mockDb.query.mockResolvedValue(mockTasks);
      
      const result = await getUpcomingTasks(mockEnv, 7);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks'),
        [7]
      );
      expect(result).toEqual(mockTasks);
    });
  });
});
