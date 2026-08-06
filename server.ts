import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for Gemini AI calls with fallback
async function callGemini(prompt: string, systemInstruction?: string, isJson: boolean = false) {
  try {
    const model = "gemini-3.6-flash";
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: isJson ? "application/json" : undefined,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (err) {
    console.error("Gemini API call failed:", err);
    throw err;
  }
}

// API Routes

// 1. Multi-Agent Copilot Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, activeAgent = "Coordinator", context } = req.body;

    const systemInstruction = `You are TravelGPT Pro's ${activeAgent} AI Agent.
You are part of a multi-agent AI travel orchestration engine (Agents: Coordinator, Planner, Flight, Hotel, Restaurant, Budget, Weather, Navigation, Packing, Visa, Memory).
Current Active Role: ${activeAgent}
Context of trip/user: ${JSON.stringify(context || {})}

Provide a highly structured, concise, friendly, and actionable response.
When appropriate, include practical recommendations, estimated prices, and suggest next steps.
If the request touches on budget, flights, weather, or itinerary, acknowledge how your agent specialized knowledge contributes.`;

    const aiResponse = await callGemini(message, systemInstruction, false);
    res.json({ success: true, agent: activeAgent, response: aiResponse });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI response",
    });
  }
});

// 2. Structured Itinerary Generator
app.post("/api/ai/plan-trip", async (req, res) => {
  try {
    const { destination, days = 3, budget, persona, interests, startingCity } = req.body;

    const prompt = `Generate a comprehensive ${days}-day travel itinerary for ${destination}.
Details:
- Starting from: ${startingCity || "Home City"}
- Total Budget: ${budget || "$1500 USD"}
- Traveler Persona: ${persona || "Balanced Explorer"}
- Key Interests: ${interests ? interests.join(", ") : "Sightseeing, Local Food, Culture"}

Return a JSON object with this exact structure:
{
  "title": "${destination} ${days}-Day Adventure",
  "destination": "${destination}",
  "estimatedTotalCost": 1200,
  "currency": "USD",
  "summary": "Short inspiring summary of the trip concept.",
  "weatherForecast": "Warm and sunny, high 24°C, low 16°C",
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "theme": "Arrival & City Highlights",
      "dailyBudgetSpent": 250,
      "activities": [
        {
          "title": "Activity Name",
          "time": "09:00 AM",
          "location": "Specific Spot Name",
          "category": "sightseeing", // sightseeing | food | transit | accommodation | relaxation | adventure
          "cost": 25,
          "rating": 4.8,
          "notes": "Practical tip or description",
          "coordinates": { "lat": 35.6762, "lng": 139.6503 }
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "flights": 400,
    "accommodation": 450,
    "food": 200,
    "activities": 100,
    "transit": 50
  },
  "packingHighlights": ["Comfortable walking shoes", "Power adapter", "Light jacket"],
  "visaRequirement": "Visa Free / Electronic Travel Authorization required for most passports"
}`;

    const jsonText = await callGemini(
      prompt,
      "You are the TravelGPT Pro Master Itinerary Planner Agent. Return ONLY raw valid JSON.",
      true
    );

    const data = JSON.parse(jsonText || "{}");
    res.json({ success: true, itinerary: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to generate itinerary" });
  }
});

// 3. Dynamic Replanning Scenario Engine
app.post("/api/ai/replan", async (req, res) => {
  try {
    const { scenario, currentItinerary, tripDetails } = req.body;

    const prompt = `Trip: ${tripDetails?.destination || "Destination"}.
Unexpected Distruption Scenario: "${scenario}" (e.g. Flight delay, heavy rain, budget emergency, sore feet).
Current Plan Summary: ${JSON.stringify(currentItinerary || {})}

Analyze the disruption and recalculate a revised, optimized plan.
Return valid JSON with:
{
  "impactAnalysis": "Explanation of how the scenario affects current plans.",
  "adjustmentsMade": ["List of specific changes made to activities/times"],
  "recalculatedCostDifference": -40,
  "revisedActivities": [
    {
      "title": "Indoor activity or revised timing",
      "time": "02:00 PM",
      "location": "Spot Name",
      "category": "relaxation",
      "cost": 15,
      "notes": "Why this replaces previous plan"
    }
  ],
  "agentNotes": "Advice from Coordinator Agent regarding the change"
}`;

    const jsonText = await callGemini(
      prompt,
      "You are the TravelGPT Pro Replanning & Disruption Agent. Output valid JSON.",
      true
    );

    const data = JSON.parse(jsonText || "{}");
    res.json({ success: true, plan: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Visa & Safety Assistant
app.post("/api/ai/visa-check", async (req, res) => {
  try {
    const { passportCountry = "United States", destination = "Japan" } = req.body;

    const prompt = `Passport Holder: ${passportCountry}.
Destination: ${destination}.

Provide visa requirements and safety advisory information as valid JSON:
{
  "status": "Visa Free" | "e-Visa Required" | "Visa on Arrival" | "Visa Required in Advance",
  "allowedStay": "Up to 90 days",
  "passportValidityRequired": "6 months minimum beyond stay",
  "requiredDocuments": ["Valid Passport", "Return Ticket", "Proof of Accommodations", "Digital Custom Declaration"],
  "safetyRating": "4.9 / 5 (Very Safe)",
  "advisoryLevel": "Level 1: Exercise Normal Precautions",
  "keyTips": ["Emergency number is 110", "Tipping is not customary", "Keep cash handy for small vendors"],
  "scamAlerts": ["Beware of unofficial taxi touts at airport", "Overpriced bar cover charges in nightlife districts"]
}`;

    const jsonText = await callGemini(
      prompt,
      "You are TravelGPT Pro Visa & Safety Agent. Output valid JSON.",
      true
    );

    res.json({ success: true, visaInfo: JSON.parse(jsonText || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Smart Packing List Generator
app.post("/api/ai/packing", async (req, res) => {
  try {
    const { destination, days, weather = "Sunny", activities = [] } = req.body;

    const prompt = `Generate a smart packing list for a ${days}-day trip to ${destination}.
Weather: ${weather}.
Activities: ${activities.join(", ") || "General sightseeing, dining"}.

Return JSON:
{
  "categories": [
    {
      "category": "Clothing & Outerwear",
      "items": [
        { "name": "5x Breathable T-Shirts", "essential": true },
        { "name": "Comfortable Walking Shoes", "essential": true }
      ]
    },
    {
      "category": "Electronics & Gear",
      "items": [
        { "name": "Universal Power Adapter", "essential": true },
        { "name": "Portable Power Bank (10,000mAh)", "essential": true }
      ]
    },
    {
      "category": "Toiletries & Health",
      "items": [
        { "name": "Travel-size Sunscreen SPF 50+", "essential": true },
        { "name": "Personal Meds & First Aid", "essential": true }
      ]
    },
    {
      "category": "Documents & Money",
      "items": [
        { "name": "Passport & Copies", "essential": true },
        { "name": "Travel Insurance Card", "essential": true }
      ]
    }
  ]
}`;

    const jsonText = await callGemini(
      prompt,
      "You are TravelGPT Pro Packing Agent. Output valid JSON.",
      true
    );

    res.json({ success: true, packingList: JSON.parse(jsonText || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. AI Travel Journal Story Generator
app.post("/api/ai/journal", async (req, res) => {
  try {
    const { location, date, bulletNotes, mood } = req.body;

    const prompt = `Location: ${location}. Date: ${date}. Mood: ${mood || "Inspired"}.
Raw notes: "${bulletNotes}"

Write an engaging, atmospheric 2-paragraph travel journal narrative entry and extract 3 key highlights.`;

    const aiText = await callGemini(
      prompt,
      "You are TravelGPT Pro Travel Writer & Memory Agent. Expressive and evocative style."
    );

    res.json({ success: true, story: aiText });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Express Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TravelGPT Pro server running on http://localhost:${PORT}`);
  });
}

startServer();
