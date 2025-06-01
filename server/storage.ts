import { users, sessions, type User, type InsertUser, type Session, type InsertSession } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSession(session: InsertSession): Promise<Session>;
  getRecentSessions(limit?: number): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  updateSession(id: number, updates: Partial<InsertSession>): Promise<Session | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private currentUserId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = { 
      ...insertSession,
      id,
      createdAt: new Date(),
      status: insertSession.status || "active",
      aiResolution: insertSession.aiResolution || null,
      actionItems: insertSession.actionItems || null,
      fairnessScore: insertSession.fairnessScore || null
    };
    this.sessions.set(id, session);
    return session;
  }

  async getRecentSessions(limit: number = 10): Promise<Session[]> {
    const allSessions = Array.from(this.sessions.values());
    return allSessions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(id: number, updates: Partial<InsertSession>): Promise<Session | undefined> {
    const existingSession = this.sessions.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession: Session = {
      ...existingSession,
      ...updates
    };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
