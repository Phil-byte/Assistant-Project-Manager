// src/tests/clients.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getAllClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient,
  searchClients
} from '../lib/clients';

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

describe('Gestion des clients', () => {
  const mockEnv = { DB: {} };
  const mockClients = [
    { 
      id: 1, 
      name: 'Acme Corporation', 
      email: 'acme@example.com',
      phone: '+33 1 23 45 67 89',
      department: 'Marketing',
      created_at: '2025-04-01T10:00:00.000Z',
      updated_at: '2025-04-01T10:00:00.000Z'
    },
    { 
      id: 2, 
      name: 'Globex Industries', 
      email: 'contact@globex.com',
      phone: '+33 9 87 65 43 21',
      department: 'Communication',
      created_at: '2025-04-02T11:00:00.000Z',
      updated_at: '2025-04-02T11:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllClients', () => {
    it('devrait récupérer tous les clients', async () => {
      mockDb.query.mockResolvedValue(mockClients);
      
      const result = await getAllClients(mockEnv);
      
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM clients ORDER BY name ASC');
      expect(result).toEqual(mockClients);
    });
  });

  describe('getClientById', () => {
    it('devrait récupérer un client par son ID', async () => {
      mockDb.queryOne.mockResolvedValue(mockClients[0]);
      
      const result = await getClientById(mockEnv, 1);
      
      expect(mockDb.queryOne).toHaveBeenCalledWith('SELECT * FROM clients WHERE id = ?', [1]);
      expect(result).toEqual(mockClients[0]);
    });

    it('devrait retourner null si le client n\'existe pas', async () => {
      mockDb.queryOne.mockResolvedValue(null);
      
      const result = await getClientById(mockEnv, 999);
      
      expect(result).toBeNull();
    });
  });

  describe('createClient', () => {
    it('devrait créer un nouveau client', async () => {
      const newClient = {
        name: 'New Client',
        email: 'new@example.com',
        phone: '+33 1 11 11 11 11',
        department: 'Sales'
      };
      
      mockDb.insert.mockResolvedValue(3);
      
      const result = await createClient(mockEnv, newClient);
      
      expect(mockDb.insert).toHaveBeenCalledWith(
        'INSERT INTO clients (name, email, phone, logo_url, department, notes) VALUES (?, ?, ?, ?, ?, ?)',
        ['New Client', 'new@example.com', '+33 1 11 11 11 11', null, 'Sales', null]
      );
      expect(result).toBe(3);
    });
  });

  describe('updateClient', () => {
    it('devrait mettre à jour un client existant', async () => {
      const updateData = {
        name: 'Updated Client',
        email: 'updated@example.com'
      };
      
      mockDb.update.mockResolvedValue(1);
      
      const result = await updateClient(mockEnv, 1, updateData);
      
      expect(mockDb.update).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE clients SET'),
        expect.arrayContaining(['Updated Client', 'updated@example.com', 1])
      );
      expect(result).toBe(true);
    });

    it('devrait retourner false si aucune mise à jour n\'est effectuée', async () => {
      const updateData = {};
      
      const result = await updateClient(mockEnv, 1, updateData);
      
      expect(mockDb.update).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('deleteClient', () => {
    it('devrait supprimer un client', async () => {
      mockDb.delete.mockResolvedValue(1);
      
      const result = await deleteClient(mockEnv, 1);
      
      expect(mockDb.delete).toHaveBeenCalledWith('DELETE FROM clients WHERE id = ?', [1]);
      expect(result).toBe(true);
    });

    it('devrait retourner false si le client n\'existe pas', async () => {
      mockDb.delete.mockResolvedValue(0);
      
      const result = await deleteClient(mockEnv, 999);
      
      expect(result).toBe(false);
    });
  });

  describe('searchClients', () => {
    it('devrait rechercher des clients par nom ou email', async () => {
      mockDb.query.mockResolvedValue([mockClients[0]]);
      
      const result = await searchClients(mockEnv, 'Acme');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE name LIKE ? OR email LIKE ? ORDER BY name ASC',
        ['%Acme%', '%Acme%']
      );
      expect(result).toEqual([mockClients[0]]);
    });
  });
});
