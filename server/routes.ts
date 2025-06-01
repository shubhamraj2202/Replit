import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScanSchema } from "@shared/schema";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
  );

  // In-memory storage for sessions
  const sessions = new Map();
  let sessionIdCounter = 1;

  // Get sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessionList = Array.from(sessions.values())
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);
      res.json(sessionList);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch session history" });
    }
  });

  // Get specific session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = sessions.get(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { relationshipContext, argumentCategory, participants } = req.body;
      
      if (!relationshipContext || !argumentCategory || !participants || participants.length < 2) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const sessionId = sessionIdCounter++;
      const session = {
        id: sessionId,
        relationshipContext,
        argumentCategory,
        participants,
        status: "active",
        createdAt: new Date(),
        aiResolution: null,
        actionItems: null,
        fairnessScore: null
      };

      sessions.set(sessionId, session);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ 
        message: "Failed to create session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Start AI mediation
  app.post("/api/sessions/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = sessions.get(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ message: "Gemini API key not configured" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build mediation prompt
      const participantSummary = session.participants.map((p: any, index: number) => 
        `Person ${index + 1} (${p.name}${p.role ? `, ${p.role}` : ''}): "${p.perspective}"`
      ).join('\n\n');

      const prompt = `You are an expert mediator helping resolve a ${session.argumentCategory} dispute between people in a ${session.relationshipContext} relationship.

Here are the perspectives from each person:

${participantSummary}

Please provide:
1. A balanced analysis of each person's valid concerns
2. The root causes vs surface complaints
3. Specific, actionable solutions that require fair compromise from everyone
4. A fairness score from 1-10 (how balanced the proposed solution is)
5. 3-5 concrete action items that each person should take

Format your response as:
ANALYSIS:
[Your analysis here]

SOLUTION:
[Your proposed resolution here]

ACTION ITEMS:
• [Action item 1]
• [Action item 2]
• [Action item 3]

FAIRNESS SCORE: [1-10]`;

      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const text = response.text();

      // Parse fairness score
      const fairnessMatch = text.match(/FAIRNESS SCORE:\s*(\d+)/i);
      const fairnessScore = fairnessMatch ? parseInt(fairnessMatch[1]) : 7;

      // Extract action items
      const actionItemsMatch = text.match(/ACTION ITEMS:\s*\n((?:•.*\n?)*)/i);
      const actionItems = actionItemsMatch 
        ? actionItemsMatch[1].split('\n').map(item => item.replace(/^•\s*/, '').trim()).filter(item => item)
        : [];

      // Update session
      session.aiResolution = text;
      session.actionItems = actionItems;
      session.fairnessScore = fairnessScore;
      session.status = "resolved";

      sessions.set(id, session);
      res.json(session);
    } catch (error) {
      console.error("Error resolving session:", error);
      res.status(500).json({ 
        message: "Failed to resolve session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
