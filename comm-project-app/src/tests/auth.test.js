// src/tests/auth.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authenticateUser, getUserSession, requireAuth, requireRole } from '../lib/auth';

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

// Mock de bcrypt
vi.mock('bcryptjs', () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue('hashed_password')
}));

// Mock de cookies
const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
};

vi.mock('next/headers', () => ({
  cookies: () => mockCookies
}));

// Mock de jose
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: () => ({
      setIssuedAt: () => ({
        setExpirationTime: () => ({
          sign: () => 'mock_token'
        })
      })
    })
  }))
}));

describe('Système d\'authentification', () => {
  const mockEnv = { DB: {} };
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed_password',
    first_name: 'Test',
    last_name: 'User',
    role: 'project_manager'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('devrait authentifier un utilisateur avec des identifiants valides', async () => {
      mockDb.queryOne.mockResolvedValue(mockUser);
      
      const result = await authenticateUser(mockEnv, 'test@example.com', 'password123');
      
      expect(mockDb.queryOne).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
        ['test@example.com']
      );
      expect(mockCookies.set).toHaveBeenCalledWith('auth-token', 'mock_token', expect.any(Object));
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'project_manager'
      });
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      mockDb.queryOne.mockResolvedValue(null);
      
      const result = await authenticateUser(mockEnv, 'nonexistent@example.com', 'password123');
      
      expect(result).toBeNull();
      expect(mockCookies.set).not.toHaveBeenCalled();
    });
  });

  describe('getUserSession', () => {
    it('devrait retourner la session utilisateur si le token est valide', async () => {
      const mockSession = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'project_manager'
      };
      
      mockCookies.get.mockReturnValue({ value: 'valid_token' });
      require('jose').jwtVerify.mockResolvedValue({ payload: mockSession });
      
      const result = await getUserSession();
      
      expect(mockCookies.get).toHaveBeenCalledWith('auth-token');
      expect(result).toEqual(mockSession);
    });

    it('devrait retourner null si aucun token n\'est présent', async () => {
      mockCookies.get.mockReturnValue(undefined);
      
      const result = await getUserSession();
      
      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('devrait retourner la session si l\'utilisateur est authentifié', async () => {
      const mockSession = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'project_manager'
      };
      
      mockCookies.get.mockReturnValue({ value: 'valid_token' });
      require('jose').jwtVerify.mockResolvedValue({ payload: mockSession });
      
      const result = await requireAuth();
      
      expect(result).toEqual(mockSession);
    });

    it('devrait rediriger vers la page de connexion si l\'utilisateur n\'est pas authentifié', async () => {
      mockCookies.get.mockReturnValue(undefined);
      
      const result = await requireAuth();
      
      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('https://example.com/login');
    });
  });

  describe('requireRole', () => {
    it('devrait retourner la session si l\'utilisateur a le rôle requis', async () => {
      const mockSession = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin'
      };
      
      mockCookies.get.mockReturnValue({ value: 'valid_token' });
      require('jose').jwtVerify.mockResolvedValue({ payload: mockSession });
      
      const result = await requireRole(['admin', 'project_manager']);
      
      expect(result).toEqual(mockSession);
    });

    it('devrait rediriger vers la page non autorisée si l\'utilisateur n\'a pas le rôle requis', async () => {
      const mockSession = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      };
      
      mockCookies.get.mockReturnValue({ value: 'valid_token' });
      require('jose').jwtVerify.mockResolvedValue({ payload: mockSession });
      
      const result = await requireRole(['admin', 'project_manager']);
      
      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('https://example.com/unauthorized');
    });
  });
});
