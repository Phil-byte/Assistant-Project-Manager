// src/tests/projects.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectsByClientId,
  getProjectsByManagerId,
  searchProjects,
  addProjectMember,
  removeProjectMember,
  getProjectMembers
} from '../lib/projects';

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

describe('Gestion des projets', () => {
  const mockEnv = { DB: {} };
  const mockProjects = [
    { 
      id: 1, 
      title: 'Website Redesign', 
      client_id: 1,
      brief_id: 1,
      description: 'Refonte complète du site web corporate',
      status: 'in_progress',
      start_date: '2025-04-01',
      due_date: '2025-05-20',
      manager_id: 2,
      created_at: '2025-04-01T10:00:00.000Z',
      updated_at: '2025-04-01T10:00:00.000Z'
    },
    { 
      id: 2, 
      title: 'Social Media Campaign', 
      client_id: 1,
      brief_id: 2,
      description: 'Campagne sur les réseaux sociaux',
      status: 'planning',
      start_date: '2025-05-01',
      due_date: '2025-06-15',
      manager_id: 2,
      created_at: '2025-04-02T11:00:00.000Z',
      updated_at: '2025-04-02T11:00:00.000Z'
    }
  ];

  const mockMembers = [
    {
      id: 1,
      project_id: 1,
      user_id: 2,
      role: 'manager',
      first_name: 'Chef',
      last_name: 'Projet',
      email: 'pm@example.com',
      user_role: 'project_manager'
    },
    {
      id: 2,
      project_id: 1,
      user_id: 3,
      role: 'member',
      first_name: 'Team',
      last_name: 'Member',
      email: 'team@example.com',
      user_role: 'team_member'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('devrait récupérer tous les projets', async () => {
      mockDb.query.mockResolvedValue(mockProjects);
      
      const result = await getAllProjects(mockEnv);
      
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM projects ORDER BY due_date ASC');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getProjectById', () => {
    it('devrait récupérer un projet par son ID', async () => {
      mockDb.queryOne.mockResolvedValue(mockProjects[0]);
      
      const result = await getProjectById(mockEnv, 1);
      
      expect(mockDb.queryOne).toHaveBeenCalledWith('SELECT * FROM projects WHERE id = ?', [1]);
      expect(result).toEqual(mockProjects[0]);
    });

    it('devrait retourner null si le projet n\'existe pas', async () => {
      mockDb.queryOne.mockResolvedValue(null);
      
      const result = await getProjectById(mockEnv, 999);
      
      expect(result).toBeNull();
    });
  });

  describe('getProjectsByClientId', () => {
    it('devrait récupérer les projets d\'un client', async () => {
      mockDb.query.mockResolvedValue(mockProjects);
      
      const result = await getProjectsByClientId(mockEnv, 1);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE client_id = ? ORDER BY due_date ASC', 
        [1]
      );
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getProjectsByManagerId', () => {
    it('devrait récupérer les projets gérés par un utilisateur', async () => {
      mockDb.query.mockResolvedValue(mockProjects);
      
      const result = await getProjectsByManagerId(mockEnv, 2);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE manager_id = ? ORDER BY due_date ASC', 
        [2]
      );
      expect(result).toEqual(mockProjects);
    });
  });

  describe('createProject', () => {
    it('devrait créer un nouveau projet', async () => {
      const newProject = {
        title: 'New Project',
        client_id: 2,
        brief_id: 3,
        description: 'Description du nouveau projet',
        status: 'planning',
        start_date: '2025-06-01',
        due_date: '2025-07-15',
        manager_id: 2
      };
      
      mockDb.insert.mockResolvedValue(3);
      
      const result = await createProject(mockEnv, newProject);
      
      expect(mockDb.insert).toHaveBeenCalledWith(
        'INSERT INTO projects (title, client_id, brief_id, description, status, start_date, due_date, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['New Project', 2, 3, 'Description du nouveau projet', 'planning', '2025-06-01', '2025-07-15', 2]
      );
      expect(result).toBe(3);
    });
  });

  describe('updateProject', () => {
    it('devrait mettre à jour un projet existant', async () => {
      const updateData = {
        title: 'Updated Project',
        status: 'on_hold'
      };
      
      mockDb.update.mockResolvedValue(1);
      
      const result = await updateProject(mockEnv, 1, updateData);
      
      expect(mockDb.update).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE projects SET'),
        expect.arrayContaining(['Updated Project', 'on_hold', 1])
      );
      expect(result).toBe(true);
    });

    it('devrait retourner false si aucune mise à jour n\'est effectuée', async () => {
      const updateData = {};
      
      const result = await updateProject(mockEnv, 1, updateData);
      
      expect(mockDb.update).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('deleteProject', () => {
    it('devrait supprimer un projet', async () => {
      mockDb.delete.mockResolvedValue(1);
      
      const result = await deleteProject(mockEnv, 1);
      
      expect(mockDb.delete).toHaveBeenCalledWith('DELETE FROM projects WHERE id = ?', [1]);
      expect(result).toBe(true);
    });

    it('devrait retourner false si le projet n\'existe pas', async () => {
      mockDb.delete.mockResolvedValue(0);
      
      const result = await deleteProject(mockEnv, 999);
      
      expect(result).toBe(false);
    });
  });

  describe('searchProjects', () => {
    it('devrait rechercher des projets par titre', async () => {
      mockDb.query.mockResolvedValue([mockProjects[0]]);
      
      const result = await searchProjects(mockEnv, 'Website');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE title LIKE ? ORDER BY due_date ASC',
        ['%Website%']
      );
      expect(result).toEqual([mockProjects[0]]);
    });
  });

  describe('gestion des membres du projet', () => {
    it('devrait ajouter un membre à un projet', async () => {
      mockDb.insert.mockResolvedValue(3);
      
      const result = await addProjectMember(mockEnv, 1, 4, 'member');
      
      expect(mockDb.insert).toHaveBeenCalledWith(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [1, 4, 'member']
      );
      expect(result).toBe(true);
    });

    it('devrait supprimer un membre d\'un projet', async () => {
      mockDb.delete.mockResolvedValue(1);
      
      const result = await removeProjectMember(mockEnv, 1, 3);
      
      expect(mockDb.delete).toHaveBeenCalledWith(
        'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
        [1, 3]
      );
      expect(result).toBe(true);
    });

    it('devrait récupérer tous les membres d\'un projet', async () => {
      mockDb.query.mockResolvedValue(mockMembers);
      
      const result = await getProjectMembers(mockEnv, 1);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT pm.*, u.first_name, u.last_name, u.email, u.role as user_role'),
        [1]
      );
      expect(result).toEqual(mockMembers);
    });
  });
});
