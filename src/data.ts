import { Partner, Task, Reward, MentalLoadNeed } from "./types";

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "Émilie",
    role: "Maman Active 👩‍💻",
    avatarColor: "bg-pink-100 text-pink-700 border-pink-200",
    avatarSeed: "👩",
    points: 120,
    totalPointsEarned: 450,
  },
  {
    id: "p2",
    name: "Thomas",
    role: "Papa Poule 👨‍🍳",
    avatarColor: "bg-blue-100 text-blue-700 border-blue-200",
    avatarSeed: "👨",
    points: 90,
    totalPointsEarned: 380,
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: "t1",
    title: "Vider le lave-vaisselle",
    description: "Ranger toute la vaisselle propre dans les placards pour libérer la cuisine.",
    points: 15,
    category: "Cuisine",
    priority: "Moyenne",
    status: "À faire",
    suggestedPartner: "Libre",
    assignedTo: null,
    createdBy: "Émilie",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
  },
  {
    id: "t2",
    title: "Rituel du coucher des enfants",
    description: "Histoires, brossage des dents et câlins pour endormir les petits dans le calme.",
    points: 35,
    category: "Enfants",
    priority: "Élevée",
    status: "En cours",
    suggestedPartner: "Partenaire",
    assignedTo: "Thomas",
    createdBy: "Émilie",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h ago
  },
  {
    id: "t3",
    title: "Nettoyer la cage du lapin / Litière",
    description: "Vider, nettoyer le bac et remettre du foin frais pour notre compagnon.",
    points: 20,
    category: "Animaux",
    priority: "Moyenne",
    status: "Terminé",
    suggestedPartner: "Partenaire",
    assignedTo: "Thomas",
    createdBy: "Émilie",
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "t4",
    title: "Payer la facture d'électricité",
    description: "Se connecter sur l'espace client EDF et régulariser l'échéancier trimestriel.",
    points: 25,
    category: "Administratif",
    priority: "Moyenne",
    status: "À faire",
    suggestedPartner: "Auteur",
    assignedTo: "Émilie",
    createdBy: "Thomas",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

export const DEFAULT_REWARDS: Reward[] = [
  {
    id: "r1",
    title: "Grasse Matinée Assurée 😴",
    description: "Le partenaire gère le réveil des enfants, prépare le petit déjeuner et vous laisse dormir jusqu'à l'heure souhaitée.",
    costPoints: 150,
    iconName: "Moon",
    unlockedBy: null,
  },
  {
    id: "r2",
    title: "Dîner de Chef à la Maison 🍳",
    description: "Votre partenaire vous cuisine un délicieux menu de l'entrée au dessert, et s'occupe de faire toute la vaisselle !",
    costPoints: 120,
    iconName: "UtensilsCrossed",
    unlockedBy: "Émilie",
    unlockedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "r3",
    title: "Massage détente (30 min) 💆‍♂️",
    description: "Un massage relaxant complet du dos et de la nuque dispensé dans le calme avec huiles de massage.",
    costPoints: 100,
    iconName: "Sparkles",
    unlockedBy: null,
  },
  {
    id: "r4",
    title: "Joker 'Vaisselle Évitée' 🍽️",
    description: "Permet de passer son tour sur la vaisselle du soir de manière totalement légitime et sans culpabilité.",
    costPoints: 40,
    iconName: "ShieldAlert",
    unlockedBy: null,
  },
  {
    id: "r5",
    title: "Soirée Libre / Sortie Copains 🍻",
    description: "Une soirée libre complète sans s'occuper du dîner ou de la logistique des enfants.",
    costPoints: 180,
    iconName: "Beer",
    unlockedBy: null,
  },
  {
    id: "r6",
    title: "Choix Royal du Film 📺",
    description: "Pouvoir choisir le film ou la série de la soirée sans négociation ni débat interminable.",
    costPoints: 50,
    iconName: "Tv",
    unlockedBy: null,
  }
];

export const DEFAULT_NEEDS: MentalLoadNeed[] = [
  {
    id: "n1",
    text: "Je rentre très tard ce soir après la réunion. Je stresse pour les bains des petits et le dîner...",
    author: "Émilie",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isProcessed: true,
    tasksGeneratedCount: 2,
  },
  {
    id: "n2",
    text: "La panière de linge sale déborde et on n'a plus de lait pour demain matin.",
    author: "Émilie",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    isProcessed: false,
    tasksGeneratedCount: 0,
  }
];

export const DEFAULT_MESSAGES = [
  {
    id: "msg-1",
    senderId: "p1",
    senderName: "Émilie",
    text: "Coucou ! J'ai bien vu que tu as nettoyé la litière aujourd'hui. Merci beaucoup, ça me soulage d'un poids ! ❤️",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "msg-2",
    senderId: "p2",
    senderName: "Thomas",
    text: "Avec plaisir ! C'était bien mérité. Je m'occupe aussi du rituel du coucher ce soir, ne t'en fais pas. Repose-toi.",
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: "msg-3",
    senderId: "p1",
    senderName: "Émilie",
    text: "T'es un amour ! N'oublie pas de valider la tâche sur l'appli pour cumuler tes points pour la grasse mat' 🥳",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "msg-4",
    senderId: "p2",
    senderName: "Thomas",
    text: "Ahah oui, je vise la grasse matinée royale de ce week-end ! 😉",
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  }
];

