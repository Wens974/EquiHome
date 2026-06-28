import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Route: Split a real-time domestic need into balanced points-based tasks
app.post("/api/split-need", async (req, res) => {
  const { need, authorName, partnerName } = req.body;
  if (!need) {
    return res.status(400).json({ error: "Le besoin ou la fatigue exprimée est vide." });
  }

  if (!ai) {
    const fallbackTasks = generateFallbackTasks(need, authorName || "Moi", partnerName || "Mon Partenaire");
    return res.json({ tasks: fallbackTasks, note: "Analyse réalisée par le moteur d'assistance local (clé API non configurée)." });
  }

  try {
    const prompt = `L'utilisateur a exprimé le besoin, le coup de fatigue ou la surcharge mentale suivante concernant son quotidien domestique : "${need}".
    L'auteur de ce message s'appelle "${authorName || "Femme"}" et son/sa partenaire s'appelle "${partnerName || "Partenaire"}".
    
    Analyse ce besoin et décompose-le en une liste de 1 à 4 tâches concrètes, positives et réalisables pour soulager le foyer et rééquilibrer la charge mentale du couple de manière constructive.
    Attribue des points à chaque tâche (de 10 à 50) reflétant l'effort physique ou la charge cognitive (par ex. planifier des devoirs vaut plus de points de charge mentale).
    Suggère un assigné ('Auteur', 'Partenaire', ou 'Libre') de manière à ce que le/la partenaire assume une part juste, surtout si l'auteur se sent surchargé(e).
    
    Retourne la liste sous forme de JSON structuré respectant exactement le schéma demandé.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: "Liste des tâches décomposées.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Titre court et positif de la tâche (ex: 'Ranger la table', 'S'occuper du bain')" },
                  description: { type: Type.STRING, description: "Description bienveillante expliquant quoi faire" },
                  points: { type: Type.INTEGER, description: "Points attribués (entre 10 et 50)" },
                  category: { 
                    type: Type.STRING, 
                    description: "Catégorie",
                    enum: ["Ménage", "Cuisine", "Enfants", "Administratif", "Courses", "Animaux", "Autre"]
                  },
                  priority: { 
                    type: Type.STRING, 
                    description: "Priorité",
                    enum: ["Basse", "Moyenne", "Élevée"]
                  },
                  suggestedPartner: { 
                    type: Type.STRING, 
                    description: "Suggestion d'assignation : 'Auteur', 'Partenaire' ou 'Libre'",
                    enum: ["Auteur", "Partenaire", "Libre"]
                  }
                },
                required: ["title", "description", "points", "category", "priority", "suggestedPartner"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Pas de réponse texte générée par Gemini.");
    }

    const data = JSON.parse(text.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("Erreur Gemini:", error);
    const fallbackTasks = generateFallbackTasks(need, authorName || "Moi", partnerName || "Mon Partenaire");
    return res.json({ tasks: fallbackTasks, note: "Analyse réalisée par le moteur d'assistance local suite à une limite technique." });
  }
});

// Helper for local fallback generation
function generateFallbackTasks(need: string, author: string, partner: string) {
  const normalized = need.toLowerCase();
  const tasks = [];

  if (normalized.includes("manger") || normalized.includes("dîner") || normalized.includes("repas") || normalized.includes("cuisine") || normalized.includes("faim")) {
    tasks.push({
      title: "Préparer le repas du soir",
      description: `Préparer un repas simple et bon pour soulager la soirée de ${author}.`,
      points: 25,
      category: "Cuisine",
      priority: "Élevée",
      suggestedPartner: "Partenaire"
    });
    tasks.push({
      title: "Ranger la cuisine et vaisselle",
      description: "Nettoyer les surfaces et charger le lave-vaisselle.",
      points: 15,
      category: "Cuisine",
      priority: "Moyenne",
      suggestedPartner: "Libre"
    });
  } else if (normalized.includes("enfant") || normalized.includes("bébé") || normalized.includes("devoir") || normalized.includes("bain") || normalized.includes("coucher")) {
    tasks.push({
      title: "Prendre en charge le rituel du coucher",
      description: `Gérer l'histoire, le brossage des dents et le coucher pour que ${author} puisse souffler.`,
      points: 30,
      category: "Enfants",
      priority: "Élevée",
      suggestedPartner: "Partenaire"
    });
    tasks.push({
      title: "Préparer les vêtements pour demain",
      description: "Choisir et poser les habits des enfants pour le lendemain matin.",
      points: 15,
      category: "Enfants",
      priority: "Basse",
      suggestedPartner: "Auteur"
    });
  } else if (normalized.includes("linge") || normalized.includes("lessive") || normalized.includes("repassage") || normalized.includes("machine")) {
    tasks.push({
      title: "Plier et ranger le linge propre",
      description: "S'occuper du linge sec accumulé et le distribuer dans les armoires.",
      points: 20,
      category: "Ménage",
      priority: "Moyenne",
      suggestedPartner: "Partenaire"
    });
    tasks.push({
      title: "Lancer un cycle de lessive",
      description: "Trier et démarrer la prochaine machine.",
      points: 10,
      category: "Ménage",
      priority: "Basse",
      suggestedPartner: "Libre"
    });
  } else if (normalized.includes("courses") || normalized.includes("acheter") || normalized.includes("frigo") || normalized.includes("manque")) {
    tasks.push({
      title: "Passer faire les courses rapides",
      description: "Acheter les produits frais ou manquants de la liste.",
      points: 20,
      category: "Courses",
      priority: "Moyenne",
      suggestedPartner: "Partenaire"
    });
  } else if (normalized.includes("ménage") || normalized.includes("aspirateur") || normalized.includes("poussière") || normalized.includes("propre") || normalized.includes("ranger")) {
    tasks.push({
      title: "Grand coup de rangement express",
      description: "Remettre à leur place les objets qui traînent dans les pièces communes.",
      points: 20,
      category: "Ménage",
      priority: "Moyenne",
      suggestedPartner: "Partenaire"
    });
    tasks.push({
      title: "Passer l'aspirateur",
      description: "Passer un coup rapide dans le salon et la cuisine.",
      points: 15,
      category: "Ménage",
      priority: "Moyenne",
      suggestedPartner: "Libre"
    });
  } else {
    // Default fallback
    tasks.push({
      title: "Relayer la surcharge du moment",
      description: `Prendre en main le besoin exprimé : "${need}"`,
      points: 25,
      category: "Autre",
      priority: "Élevée",
      suggestedPartner: "Partenaire"
    });
    tasks.push({
      title: "Moment de déconnexion à deux",
      description: "Prendre 10 minutes pour boire une tisane ou discuter ensemble sans parler logistique.",
      points: 10,
      category: "Autre",
      priority: "Basse",
      suggestedPartner: "Libre"
    });
  }
  return tasks;
}

// Setup Vite & static serving
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
    console.log(`[EquiHome] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
