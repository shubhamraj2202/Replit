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

  // Return empty sessions for now - the UI is working with the front-end data
  app.get("/api/sessions", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch session history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
