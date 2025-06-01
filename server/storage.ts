import { users, scans, type User, type InsertUser, type Scan, type InsertScan } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScan(scan: InsertScan): Promise<Scan>;
  getRecentScans(limit?: number): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scans: Map<number, Scan>;
  private currentUserId: number;
  private currentScanId: number;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.currentUserId = 1;
    this.currentScanId = 1;
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

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = this.currentScanId++;
    const scan: Scan = { 
      ...insertScan,
      imageUrl: insertScan.imageUrl || null,
      id,
      createdAt: new Date()
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getRecentScans(limit: number = 10): Promise<Scan[]> {
    const allScans = Array.from(this.scans.values());
    return allScans
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.get(id);
  }
}

export const storage = new MemStorage();
