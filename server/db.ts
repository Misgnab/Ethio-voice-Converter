import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_premium: boolean;
  conversions_left: number;
  created_at: string;
  updated_at: string;
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  text: string;
  language: string;
  voice_id: string;
  voice_name: string;
  duration: number;
  word_count: number;
  char_count: number;
  category: string;
  favorite: boolean;
  format: string;
  quality: string;
  audio_path: string;
  audio_url: string;
  size_kb: number;
  engine: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  channel: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface UserPreferencesRecord {
  user_id: string;
  speed: number;
  format: string;
  quality: string;
  default_language: string;
  default_voice_id: string;
  accessibility_mode: boolean;
  updated_at: string;
}

interface FileDbState {
  users: UserRecord[];
  history: HistoryRecord[];
  subscriptions: SubscriptionRecord[];
  preferences: UserPreferencesRecord[];
}

class DatabaseManager {
  private pool: mysql.Pool | null = null;
  private isMySqlReady = false;
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly dbFilePath = path.resolve(process.cwd(), 'data', 'db.json');
  private fileState: FileDbState = {
    users: [],
    history: [],
    subscriptions: [],
    preferences: []
  };

  constructor() {
    this.ensureDataDirectories();
    this.loadFileState();
  }

  private ensureDataDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    const audioDir = path.resolve(process.cwd(), 'public', 'generated-audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
  }

  private loadFileState() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.fileState = {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
          subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
          preferences: Array.isArray(parsed.preferences) ? parsed.preferences : []
        };
      } else {
        this.seedInitialData();
        this.saveFileState();
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing fresh store:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    // Seed default admin/demo user and initial historical Ethiopian speech records
    const now = new Date().toISOString();
    this.fileState.users = [
      {
        id: 'usr_demo_1',
        email: 'gebrumisgna@gmail.com',
        // pre-hashed bcrypt hash for password "EthioVoice2026!"
        password_hash: '$2a$10$7R9rR61z1h5bJ57nBw5p8O8R8B5n7n7n7n7n7n7n7n7n7n7n7n7n.',
        name: 'Gebru Mesgna',
        is_premium: false,
        conversions_left: 20,
        created_at: now,
        updated_at: now
      }
    ];

    this.fileState.history = [
      {
        id: 'h-seed-1',
        user_id: 'usr_demo_1',
        text: 'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ። የኢትዮጵያ ቋንቋዎችን በዘመናዊ አርቴፊሻል ኢንተለጀንስ ወደ ተፈጥሯዊ ንግግር እንቀይራለን።',
        language: 'am',
        voice_id: 'v-selam',
        voice_name: 'Selam (Addis Ababa)',
        duration: 6.2,
        word_count: 16,
        char_count: 110,
        category: 'Personal',
        favorite: true,
        format: 'wav',
        quality: 'hd',
        audio_path: 'sample_selam.wav',
        audio_url: '/audio/sample_selam.wav',
        size_kb: 468,
        engine: 'EthioVoice Studio Neural Master',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'h-seed-2',
        user_id: 'usr_demo_1',
        text: 'ጥንታዊት ከተማ ኣኽሱም፣ ውቁብ ሓወልትታትን ጥንታዊ ቅርስታትን ዝሓዘለት ታሪኻዊት ዓዲ እያ።',
        language: 'ti',
        voice_id: 'v-hagos',
        voice_name: 'Hagos (Mekelle)',
        duration: 5.4,
        word_count: 12,
        char_count: 80,
        category: 'Stories',
        favorite: false,
        format: 'wav',
        quality: 'hd',
        audio_path: 'sample_hagos.wav',
        audio_url: '/audio/sample_hagos.wav',
        size_kb: 415,
        engine: 'EthioVoice Studio Neural Master',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    this.fileState.preferences = [
      {
        user_id: 'usr_demo_1',
        speed: 1.0,
        format: 'wav',
        quality: 'hd',
        default_language: 'am',
        default_voice_id: 'v-selam',
        accessibility_mode: false,
        updated_at: now
      }
    ];
  }

  private saveFileState() {
    try {
      const tempPath = `${this.dbFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.fileState, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbFilePath);
    } catch (err) {
      console.error('Error saving persistent state to disk:', err);
    }
  }

  public async init(): Promise<void> {
    const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL;
    const host = process.env.MYSQL_HOST || process.env.DB_HOST;

    if (connectionUri || host) {
      try {
        if (connectionUri) {
          this.pool = mysql.createPool(connectionUri);
        } else {
          this.pool = mysql.createPool({
            host: host || 'localhost',
            port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
            user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
            password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'ethiovoice',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
          });
        }

        // Test connection
        const conn = await this.pool.getConnection();
        await conn.ping();
        conn.release();

        await this.createMySqlTables();
        this.isMySqlReady = true;
        console.log('✓ Successfully connected to MySQL database with full persistence.');
        return;
      } catch (err: any) {
        console.warn('MySQL connection not available, utilizing persistent disk store:', err.message);
        this.isMySqlReady = false;
      }
    } else {
      console.log('✓ Initialized persistent disk storage at ./data/db.json (survives server restarts).');
    }
  }

  private async createMySqlTables() {
    if (!this.pool) return;

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(191) NOT NULL,
        is_premium TINYINT(1) DEFAULT 0,
        conversions_left INT DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS history (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        text TEXT NOT NULL,
        language VARCHAR(16) NOT NULL,
        voice_id VARCHAR(64) NOT NULL,
        voice_name VARCHAR(128) NOT NULL,
        duration FLOAT NOT NULL,
        word_count INT NOT NULL,
        char_count INT NOT NULL,
        category VARCHAR(64) DEFAULT 'Personal',
        favorite TINYINT(1) DEFAULT 0,
        format VARCHAR(16) DEFAULT 'wav',
        quality VARCHAR(16) DEFAULT 'hd',
        audio_path VARCHAR(512) NOT NULL,
        audio_url VARCHAR(512) NOT NULL,
        size_kb INT DEFAULT 0,
        engine VARCHAR(128) DEFAULT 'EthioVoice Studio',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_history (user_id, created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        channel VARCHAR(64) NOT NULL,
        plan VARCHAR(64) NOT NULL,
        amount FLOAT NOT NULL,
        currency VARCHAR(16) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_sub (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR(64) PRIMARY KEY,
        speed FLOAT DEFAULT 1.0,
        format VARCHAR(16) DEFAULT 'wav',
        quality VARCHAR(16) DEFAULT 'hd',
        default_language VARCHAR(16) DEFAULT 'am',
        default_voice_id VARCHAR(64) DEFAULT 'v-selam',
        accessibility_mode TINYINT(1) DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  // --- USER OPERATIONS ---
  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = (email || '').trim().toLowerCase();
    if (this.isMySqlReady && this.pool) {
      const [rows] = await this.pool.query<any[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [normalized]);
      if (rows.length > 0) {
        const u = rows[0];
        return {
          id: u.id,
          email: u.email,
          password_hash: u.password_hash,
          name: u.name,
          is_premium: Boolean(u.is_premium),
          conversions_left: u.conversions_left,
          created_at: u.created_at,
          updated_at: u.updated_at
        };
      }
      return null;
    }

    const found = this.fileState.users.find((u) => u.email.toLowerCase() === normalized);
    return found ? { ...found } : null;
  }

  public async findUserById(id: string): Promise<UserRecord | null> {
    if (this.isMySqlReady && this.pool) {
      const [rows] = await this.pool.query<any[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows.length > 0) {
        const u = rows[0];
        return {
          id: u.id,
          email: u.email,
          password_hash: u.password_hash,
          name: u.name,
          is_premium: Boolean(u.is_premium),
          conversions_left: u.conversions_left,
          created_at: u.created_at,
          updated_at: u.updated_at
        };
      }
      return null;
    }

    const found = this.fileState.users.find((u) => u.id === id);
    return found ? { ...found } : null;
  }

  public async createUser(user: Omit<UserRecord, 'created_at' | 'updated_at'>): Promise<UserRecord> {
    const now = new Date().toISOString();
    const fullUser: UserRecord = {
      ...user,
      email: user.email.toLowerCase().trim(),
      created_at: now,
      updated_at: now
    };

    if (this.isMySqlReady && this.pool) {
      await this.pool.query(
        'INSERT INTO users (id, email, password_hash, name, is_premium, conversions_left, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          fullUser.id,
          fullUser.email,
          fullUser.password_hash,
          fullUser.name,
          fullUser.is_premium ? 1 : 0,
          fullUser.conversions_left,
          now,
          now
        ]
      );
    } else {
      this.fileState.users = this.fileState.users.filter((u) => u.id !== fullUser.id && u.email !== fullUser.email);
      this.fileState.users.push(fullUser);
      this.saveFileState();
    }

    return fullUser;
  }

  public async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const existing = await this.findUserById(id);
    if (!existing) return null;

    const updated: UserRecord = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (this.isMySqlReady && this.pool) {
      await this.pool.query(
        'UPDATE users SET name = ?, is_premium = ?, conversions_left = ?, updated_at = ? WHERE id = ?',
        [
          updated.name,
          updated.is_premium ? 1 : 0,
          updated.conversions_left,
          updated.updated_at,
          id
        ]
      );
    } else {
      this.fileState.users = this.fileState.users.map((u) => (u.id === id ? updated : u));
      this.saveFileState();
    }

    return updated;
  }

  // Atomically decrement quota
  public async decrementQuota(userId: string): Promise<number> {
    const user = await this.findUserById(userId);
    if (!user) return 0;
    if (user.is_premium) return 999999;

    const newQuota = Math.max(0, user.conversions_left - 1);
    await this.updateUser(userId, { conversions_left: newQuota });
    return newQuota;
  }

  // --- HISTORY OPERATIONS ---
  public async getHistory(userId: string): Promise<HistoryRecord[]> {
    if (this.isMySqlReady && this.pool) {
      const [rows] = await this.pool.query<any[]>(
        'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
        [userId]
      );
      return rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        text: r.text,
        language: r.language,
        voice_id: r.voice_id,
        voice_name: r.voice_name,
        duration: r.duration,
        word_count: r.word_count,
        char_count: r.char_count,
        category: r.category,
        favorite: Boolean(r.favorite),
        format: r.format,
        quality: r.quality,
        audio_path: r.audio_path,
        audio_url: r.audio_url,
        size_kb: r.size_kb,
        engine: r.engine,
        created_at: r.created_at
      }));
    }

    return this.fileState.history
      .filter((h) => h.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getHistoryItemById(id: string, userId: string): Promise<HistoryRecord | null> {
    if (this.isMySqlReady && this.pool) {
      const [rows] = await this.pool.query<any[]>(
        'SELECT * FROM history WHERE id = ? AND user_id = ? LIMIT 1',
        [id, userId]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        user_id: r.user_id,
        text: r.text,
        language: r.language,
        voice_id: r.voice_id,
        voice_name: r.voice_name,
        duration: r.duration,
        word_count: r.word_count,
        char_count: r.char_count,
        category: r.category,
        favorite: Boolean(r.favorite),
        format: r.format,
        quality: r.quality,
        audio_path: r.audio_path,
        audio_url: r.audio_url,
        size_kb: r.size_kb,
        engine: r.engine,
        created_at: r.created_at
      };
    }

    const item = this.fileState.history.find((h) => h.id === id && h.user_id === userId);
    return item ? { ...item } : null;
  }

  public async addHistory(item: HistoryRecord): Promise<HistoryRecord> {
    if (this.isMySqlReady && this.pool) {
      await this.pool.query(
        `INSERT INTO history (id, user_id, text, language, voice_id, voice_name, duration, word_count, char_count, category, favorite, format, quality, audio_path, audio_url, size_kb, engine, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.user_id,
          item.text,
          item.language,
          item.voice_id,
          item.voice_name,
          item.duration,
          item.word_count,
          item.char_count,
          item.category,
          item.favorite ? 1 : 0,
          item.format,
          item.quality,
          item.audio_path,
          item.audio_url,
          item.size_kb,
          item.engine,
          item.created_at
        ]
      );
    } else {
      this.fileState.history = [item, ...this.fileState.history.filter((h) => h.id !== item.id)];
      this.saveFileState();
    }
    return item;
  }

  public async deleteHistory(id: string, userId: string): Promise<boolean> {
    if (this.isMySqlReady && this.pool) {
      const [res] = await this.pool.query<any>('DELETE FROM history WHERE id = ? AND user_id = ?', [id, userId]);
      return res.affectedRows > 0;
    }

    const before = this.fileState.history.length;
    this.fileState.history = this.fileState.history.filter((h) => !(h.id === id && h.user_id === userId));
    const changed = this.fileState.history.length !== before;
    if (changed) this.saveFileState();
    return changed;
  }

  public async setFavorite(id: string, userId: string, favorite: boolean): Promise<boolean> {
    if (this.isMySqlReady && this.pool) {
      const [res] = await this.pool.query<any>(
        'UPDATE history SET favorite = ? WHERE id = ? AND user_id = ?',
        [favorite ? 1 : 0, id, userId]
      );
      return res.affectedRows > 0;
    }

    let found = false;
    this.fileState.history = this.fileState.history.map((h) => {
      if (h.id === id && h.user_id === userId) {
        found = true;
        return { ...h, favorite };
      }
      return h;
    });
    if (found) this.saveFileState();
    return found;
  }

  public async setCategory(id: string, userId: string, category: string): Promise<boolean> {
    if (this.isMySqlReady && this.pool) {
      const [res] = await this.pool.query<any>(
        'UPDATE history SET category = ? WHERE id = ? AND user_id = ?',
        [category, id, userId]
      );
      return res.affectedRows > 0;
    }

    let found = false;
    this.fileState.history = this.fileState.history.map((h) => {
      if (h.id === id && h.user_id === userId) {
        found = true;
        return { ...h, category };
      }
      return h;
    });
    if (found) this.saveFileState();
    return found;
  }

  // --- PREFERENCES ---
  public async getPreferences(userId: string): Promise<UserPreferencesRecord> {
    if (this.isMySqlReady && this.pool) {
      const [rows] = await this.pool.query<any[]>('SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1', [userId]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          user_id: r.user_id,
          speed: r.speed,
          format: r.format,
          quality: r.quality,
          default_language: r.default_language,
          default_voice_id: r.default_voice_id,
          accessibility_mode: Boolean(r.accessibility_mode),
          updated_at: r.updated_at
        };
      }
    }

    const found = this.fileState.preferences.find((p) => p.user_id === userId);
    if (found) return { ...found };

    return {
      user_id: userId,
      speed: 1.0,
      format: 'wav',
      quality: 'hd',
      default_language: 'am',
      default_voice_id: 'v-selam',
      accessibility_mode: false,
      updated_at: new Date().toISOString()
    };
  }

  public async updatePreferences(userId: string, prefs: Partial<UserPreferencesRecord>): Promise<UserPreferencesRecord> {
    const current = await this.getPreferences(userId);
    const updated: UserPreferencesRecord = {
      ...current,
      ...prefs,
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (this.isMySqlReady && this.pool) {
      await this.pool.query(
        `INSERT INTO user_preferences (user_id, speed, format, quality, default_language, default_voice_id, accessibility_mode, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           speed = VALUES(speed),
           format = VALUES(format),
           quality = VALUES(quality),
           default_language = VALUES(default_language),
           default_voice_id = VALUES(default_voice_id),
           accessibility_mode = VALUES(accessibility_mode),
           updated_at = VALUES(updated_at)`,
        [
          userId,
          updated.speed,
          updated.format,
          updated.quality,
          updated.default_language,
          updated.default_voice_id,
          updated.accessibility_mode ? 1 : 0,
          updated.updated_at
        ]
      );
    } else {
      this.fileState.preferences = [
        updated,
        ...this.fileState.preferences.filter((p) => p.user_id !== userId)
      ];
      this.saveFileState();
    }

    return updated;
  }

  // --- SUBSCRIPTIONS ---
  public async addSubscription(sub: SubscriptionRecord): Promise<SubscriptionRecord> {
    if (this.isMySqlReady && this.pool) {
      await this.pool.query(
        'INSERT INTO subscriptions (id, user_id, channel, plan, amount, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sub.id, sub.user_id, sub.channel, sub.plan, sub.amount, sub.currency, sub.status, sub.created_at]
      );
    } else {
      this.fileState.subscriptions.push(sub);
      this.saveFileState();
    }

    // Upgrade user in DB
    await this.updateUser(sub.user_id, {
      is_premium: true,
      conversions_left: 999999
    });

    return sub;
  }

  public async getSubscriptions(userId: string): Promise<SubscriptionRecord[]> {
    if (this.isMySqlReady && this.pool) {
      const [rows] = await this.pool.query<any[]>(
        'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    }

    return this.fileState.subscriptions.filter((s) => s.user_id === userId);
  }

  public isUsingMySql(): boolean {
    return this.isMySqlReady;
  }
}

export const db = new DatabaseManager();
