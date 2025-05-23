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

  // Get recent scans
  app.get("/api/scans", async (req, res) => {
    try {
      const scans = await storage.getRecentScans(10);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scan history" });
    }
  });

  // Get specific scan
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scan = await storage.getScan(id);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      
      res.json(scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  // Analyze food image
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ message: "Gemini API key not configured" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert image buffer to base64
      const imageData = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt = "Is the food in this image vegan? Be detailed and explain why or why not. Please analyze all visible ingredients and provide your confidence level as a percentage at the end of your response.";

      const result = await model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();

      // Parse the response to extract information
      const isVegan = text.toLowerCase().includes("vegan") && 
                     !text.toLowerCase().includes("not vegan") && 
                     !text.toLowerCase().includes("isn't vegan");
      
      // Extract confidence level from response (look for percentage)
      const confidenceMatch = text.match(/(\d+)%/);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

      // Extract or generate food name
      const lines = text.split('\n');
      let foodName = "Food Item";
      
      // Try to extract food name from response
      for (const line of lines) {
        if (line.toLowerCase().includes("this") && 
            (line.toLowerCase().includes("appears to be") || 
             line.toLowerCase().includes("looks like") ||
             line.toLowerCase().includes("is a"))) {
          // Extract potential food name
          const nameMatch = line.match(/(?:appears to be|looks like|is a)\s+(?:a\s+)?([^.!?]+)/i);
          if (nameMatch) {
            foodName = nameMatch[1].trim();
            break;
          }
        }
      }

      const scanData = {
        foodName,
        isVegan,
        analysis: text,
        confidence,
        imageUrl: null // We're not storing images in this implementation
      };

      // Validate and create scan record
      const validatedScan = insertScanSchema.parse(scanData);
      const savedScan = await storage.createScan(validatedScan);

      res.json(savedScan);
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ 
        message: "Failed to analyze image. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
