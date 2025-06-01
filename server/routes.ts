import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
  );

  // Get recent sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getRecentSessions(10);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch session history" });
    }
  });

  // Get specific session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Create new mediation session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = {
        relationshipContext: req.body.relationshipContext,
        argumentCategory: req.body.argumentCategory,
        participants: req.body.participants,
        status: "active"
      };

      // Validate session data
      const validatedSession = insertSessionSchema.parse(sessionData);
      const savedSession = await storage.createSession(validatedSession);

      res.json(savedSession);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ 
        message: "Failed to create mediation session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Resolve mediation session with AI
  app.post("/api/sessions/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
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

      // Update session with AI resolution
      const updatedSession = await storage.updateSession(id, {
        aiResolution: text,
        actionItems,
        fairnessScore,
        status: "resolved"
      });

      res.json(updatedSession);
    } catch (error) {
      console.error("Error resolving session:", error);
      res.status(500).json({ 
        message: "Failed to resolve mediation session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
