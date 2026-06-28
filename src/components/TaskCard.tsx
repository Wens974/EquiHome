import React from "react";
import { Task, Partner } from "../types";
import { 
  Utensils, 
  Baby, 
  Home, 
  FileText, 
  ShoppingCart, 
  Scissors, 
  HelpCircle,
  Clock, 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Check,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

interface TaskCardProps {
  key?: string;
  task: Task;
  currentPartner: Partner;
  partners: Partner[];
  onClaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onRelease: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const CATEGORY_ICONS = {
  Ménage: Home,
  Cuisine: Utensils,
  Enfants: Baby,
  Administratif: FileText,
  Courses: ShoppingCart,
  Animaux: Scissors,
  Autre: HelpCircle
};

const CATEGORY_COLORS = {
  Ménage: "bg-natural-sage/20 text-natural-olive border-natural-sage/30",
  Cuisine: "bg-natural-terracotta/15 text-natural-terracotta border-natural-terracotta/25",
  Enfants: "bg-natural-accent/15 text-natural-accent border-natural-accent/25",
  Administratif: "bg-natural-sage/30 text-natural-olive border-natural-sage/40",
  Courses: "bg-natural-terracotta/25 text-natural-terracotta border-natural-terracotta/35",
  Animaux: "bg-natural-accent/25 text-natural-accent border-natural-accent/35",
  Autre: "bg-natural-bg text-natural-accent border-natural-line"
};

const PRIORITY_COLORS = {
  Basse: "bg-natural-bg text-natural-accent border border-natural-line/50",
  Moyenne: "bg-natural-accent/15 text-natural-accent border border-natural-accent/25",
  Élevée: "bg-natural-terracotta/15 text-natural-terracotta border border-natural-terracotta/25"
};

export default function TaskCard({ 
  task, 
  currentPartner, 
  partners, 
  onClaim, 
  onComplete, 
  onRelease, 
  onDelete 
}: TaskCardProps) {
  const IconComponent = CATEGORY_ICONS[task.category] || HelpCircle;
  const categoryStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Autre;
  
  const assignedPartnerObj = task.assignedTo 
    ? partners.find(p => p.name.toLowerCase() === task.assignedTo?.toLowerCase())
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`border rounded-2xl p-5 bg-natural-panel border-natural-line shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${
        task.status === "Terminé" ? "opacity-75 bg-natural-bg/40 border-dashed" : ""
      }`}
      id={`task-card-${task.id}`}
    >
      {/* Category & Priority header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryStyle}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {task.category}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        
        <span className="flex items-center gap-1 text-xs font-bold text-natural-olive bg-natural-bg px-2.5 py-1 rounded-xl border border-natural-line">
          🌱 +{task.points} pts
        </span>
      </div>

      {/* Title & Description */}
      <h3 className={`font-serif font-bold text-natural-text text-xl leading-snug ${task.status === "Terminé" ? "line-through opacity-50" : ""}`}>
        {task.title}
      </h3>
      <p className={`text-sm text-natural-text/80 mt-1.5 leading-relaxed ${task.status === "Terminé" ? "opacity-50" : ""}`}>
        {task.description}
      </p>

      {/* Relates to an IA-generated need label */}
      {task.relatedNeed && (
        <div className="mt-3 bg-natural-bg/70 border border-natural-line rounded-xl p-2.5 text-xs text-natural-text/90 flex items-start gap-1.5">
          <span className="font-semibold text-natural-accent shrink-0">Inspiré par :</span>
          <span className="italic text-natural-text/80">"{task.relatedNeed}"</span>
        </div>
      )}

      {/* Divider */}
      <div className="my-4 border-t border-natural-line"></div>

      {/* Footer info: creation and assignment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Assignment state */}
        <div className="flex items-center gap-2">
          {task.status === "Terminé" ? (
            <div className="flex items-center gap-2 text-natural-olive text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-natural-sage" />
              <span>Complétée par {task.assignedTo || "quelqu'un"}</span>
            </div>
          ) : assignedPartnerObj ? (
            <div className="flex items-center gap-2 text-xs text-natural-text bg-natural-bg px-3 py-1 rounded-full border border-natural-line">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-natural-accent/20 text-natural-accent font-bold border border-natural-accent/30">
                {assignedPartnerObj.avatarSeed}
              </div>
              <span>Gérée par <strong className="font-bold">{assignedPartnerObj.name}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-natural-accent bg-natural-bg/60 px-3 py-1 rounded-full border border-natural-line">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Suggérée : <strong className="font-semibold">{task.suggestedPartner === "Auteur" ? task.createdBy : task.suggestedPartner === "Partenaire" ? "L'autre" : "Libre"}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          {task.status !== "Terminé" && (
            <>
              {/* Claim/Release buttons */}
              {task.assignedTo === currentPartner.name ? (
                <button
                  id={`btn-release-${task.id}`}
                  onClick={() => onRelease(task.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-natural-accent hover:text-natural-terracotta hover:bg-natural-terracotta/10 rounded-lg transition"
                >
                  Désassigner
                </button>
              ) : !task.assignedTo ? (
                <button
                  id={`btn-claim-${task.id}`}
                  onClick={() => onClaim(task.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-natural-sage/20 text-natural-olive hover:bg-natural-sage/40 rounded-lg transition border border-natural-sage/30"
                >
                  <Users className="w-3.5 h-3.5" />
                  Je m'en occupe
                </button>
              ) : null}

              {/* Complete button */}
              {(task.assignedTo === currentPartner.name || !task.assignedTo) && (
                <button
                  id={`btn-complete-${task.id}`}
                  onClick={() => onComplete(task.id)}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold bg-natural-terracotta hover:bg-natural-terracotta/90 text-white rounded-lg transition shadow-sm hover:shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  Terminé !
                </button>
              )}
            </>
          )}

          {/* Delete button (only if not completed) */}
          {task.status !== "Terminé" && (
            <button
              id={`btn-delete-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-natural-accent/50 hover:text-natural-terracotta hover:bg-natural-terracotta/10 rounded-lg transition"
              title="Supprimer la tâche"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
