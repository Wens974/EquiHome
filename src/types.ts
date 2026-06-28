export type TaskCategory = "Ménage" | "Cuisine" | "Enfants" | "Administratif" | "Courses" | "Animaux" | "Autre";
export type TaskPriority = "Basse" | "Moyenne" | "Élevée";
export type TaskStatus = "À faire" | "En cours" | "Terminé";

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  suggestedPartner: "Auteur" | "Partenaire" | "Libre";
  assignedTo: string | null; // Name or ID of the partner
  createdBy: string; // Partner name who posted the underlying need
  createdAt: string;
  completedAt?: string;
  relatedNeed?: string; // Original raw need text
}

export interface Partner {
  id: string;
  name: string;
  role: string; // e.g. "Maman Active", "Papa Poule", "Super Conjointe"
  avatarColor: string; // hex or tailwind class
  avatarSeed: string; // emoji or designator
  points: number;
  totalPointsEarned: number;
}

export interface Reward {
  id: string;
  title: string;
  costPoints: number;
  description: string;
  iconName: string; // Lucide icon
  unlockedBy: string | null;
  unlockedAt?: string;
}

export interface MentalLoadNeed {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  isProcessed: boolean;
  tasksGeneratedCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface NotificationToast {
  id: string;
  message: string;
  type: "success" | "info" | "complete" | "need";
  createdAt: string;
}

