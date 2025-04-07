// src/lib/db.js
import { D1Database } from '@cloudflare/workers-types';

/**
 * Classe utilitaire pour interagir avec la base de données D1
 */
export class Database {
  constructor(private db: D1Database) {}

  /**
   * Exécute une requête SQL avec des paramètres
   */
  async query(sql: string, params: any[] = []) {
    try {
      const result = await this.db.prepare(sql).bind(...params).all();
      return result.results;
    } catch (error) {
      console.error('Erreur de base de données:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête SQL et retourne un seul résultat
   */
  async queryOne(sql: string, params: any[] = []) {
    try {
      const result = await this.db.prepare(sql).bind(...params).first();
      return result;
    } catch (error) {
      console.error('Erreur de base de données:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête d'insertion et retourne l'ID généré
   */
  async insert(sql: string, params: any[] = []) {
    try {
      const result = await this.db.prepare(sql).bind(...params).run();
      return result.meta.last_row_id;
    } catch (error) {
      console.error('Erreur d\'insertion:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête de mise à jour et retourne le nombre de lignes affectées
   */
  async update(sql: string, params: any[] = []) {
    try {
      const result = await this.db.prepare(sql).bind(...params).run();
      return result.meta.changes;
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête de suppression et retourne le nombre de lignes affectées
   */
  async delete(sql: string, params: any[] = []) {
    try {
      const result = await this.db.prepare(sql).bind(...params).run();
      return result.meta.changes;
    } catch (error) {
      console.error('Erreur de suppression:', error);
      throw error;
    }
  }
}

/**
 * Fonction pour obtenir une instance de la base de données
 */
export function getDatabase(env: any) {
  return new Database(env.DB);
}
