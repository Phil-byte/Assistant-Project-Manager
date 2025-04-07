// src/lib/auth.ts
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { getDatabase } from './db';
import bcrypt from 'bcryptjs';

// Clé secrète pour JWT - dans un environnement de production, utiliser une variable d'environnement
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface UserSession {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Authentifie un utilisateur avec email et mot de passe
 */
export async function authenticateUser(env: any, email: string, password: string) {
  const db = getDatabase(env);
  
  // Recherche de l'utilisateur par email
  const user = await db.queryOne(
    'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
    [email]
  );
  
  if (!user) {
    return null;
  }
  
  // Vérification du mot de passe
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return null;
  }
  
  // Création de la session utilisateur
  const session: UserSession = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role
  };
  
  // Génération du token JWT
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  
  // Stockage du token dans un cookie
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 heures
    path: '/'
  });
  
  return session;
}

/**
 * Déconnecte l'utilisateur en supprimant le cookie
 */
export function logoutUser() {
  cookies().delete('auth-token');
}

/**
 * Récupère la session utilisateur à partir du token JWT
 */
export async function getUserSession(): Promise<UserSession | null> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as UserSession;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export async function requireAuth() {
  const session = await getUserSession();
  
  if (!session) {
    return Response.redirect(new URL('/login', 'https://example.com'));
  }
  
  return session;
}

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique
 */
export async function requireRole(roles: string[]) {
  const session = await getUserSession();
  
  if (!session) {
    return Response.redirect(new URL('/login', 'https://example.com'));
  }
  
  if (!roles.includes(session.role)) {
    return Response.redirect(new URL('/unauthorized', 'https://example.com'));
  }
  
  return session;
}

/**
 * Hache un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
