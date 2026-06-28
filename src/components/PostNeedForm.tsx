import React, { useState, FormEvent } from "react";
import { Partner, Task, TaskCategory, TaskPriority } from "../types";
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  AlertCircle, 
  Check, 
  RefreshCw, 
  Plus,
  Trash2,
  Utensils,
  Baby,
  Home,
  FileText,
  ShoppingCart,
  Scissors
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PostNeedFormProps {
  currentPartner: Partner;
  partners: Partner[];
  onTasksAdded: (newTasks: Task[]) => void;
  onNeedLogged: (text: string, tasksCount: number) => void;
}

const QUICK_EXAMPLES = [
  {
    text: "Je suis crevée de ma journée, le repas n'est pas fait et la vaisselle du midi déborde dans l'évier.",
    label: "🍳 Cuisine & fatigue"
  },
  {
    text: "Je rentre tard du bureau ce soir, il faut s'occuper du bain des enfants et promener le chien.",
    label: "👦 Enfants & Animaux"
  },
  {
    text: "La panière de linge est pleine, on n'a plus de lait au frigo, et je n'ai toujours pas payé la crèche.",
    label: "🧺 Ménage & Administratif"
  }
];

const CATEGORIES: TaskCategory[] = ["Ménage", "Cuisine", "Enfants", "Administratif", "Courses", "Animaux", "Autre"];
const PRIORITIES: TaskPriority[] = ["Basse", "Moyenne", "Élevée"];

export default function PostNeedForm({ currentPartner, partners, onTasksAdded, onNeedLogged }: PostNeedFormProps) {
  const [needText, setNeedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tasks suggested by Gemini/Local engine before final validation
  const [suggestedTasks, setSuggestedTasks] = useState<Omit<Task, "id" | "status" | "createdBy" | "createdAt">[]>([]);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const handleExampleClick = (text: string) => {
    setNeedText(text);
    setError(null);
  };

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!needText.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestedTasks([]);
    setAiNote(null);

    const otherPartner = partners.find(p => p.id !== currentPartner.id);

    try {
      const response = await fetch("/api/split-need", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          need: needText,
          authorName: currentPartner.name,
          partnerName: otherPartner ? otherPartner.name : "Partenaire"
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de joindre le service d'analyse.");
      }

      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        // Map any suggestedPartner relative names to real partner IDs or default choices
        const processed = data.tasks.map((t: any) => {
          let assignedTo = null;
          if (t.suggestedPartner === "Auteur") {
            assignedTo = currentPartner.name;
          } else if (t.suggestedPartner === "Partenaire" && otherPartner) {
            assignedTo = otherPartner.name;
          }
          
          return {
            title: t.title || "Tâche sans titre",
            description: t.description || "",
            points: Number(t.points) || 15,
            category: (t.category as TaskCategory) || "Autre",
            priority: (t.priority as TaskPriority) || "Moyenne",
            suggestedPartner: t.suggestedPartner || "Libre",
            assignedTo: assignedTo,
            relatedNeed: needText
          };
        });

        setSuggestedTasks(processed);
        if (data.note) {
          setAiNote(data.note);
        }
      } else {
        throw new Error("Le format des tâches retournées est incorrect.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Désolé, une erreur est survenue lors de l'analyse du besoin. N'hésitez pas à réessayer ou à créer une tâche manuellement.");
    } finally {
      setLoading(false);
    }
  };

  const handleModifyTask = (index: number, field: string, value: any) => {
    setSuggestedTasks(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleDeleteSuggested = (index: number) => {
    setSuggestedTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTaskSuggestion = () => {
    const otherPartner = partners.find(p => p.id !== currentPartner.id);
    setSuggestedTasks(prev => [
      ...prev,
      {
        title: "Nouvelle tâche",
        description: "À préciser...",
        points: 15,
        category: "Autre",
        priority: "Moyenne",
        suggestedPartner: "Libre",
        assignedTo: null,
        relatedNeed: needText
      }
    ]);
  };

  const handleCommitTasks = () => {
    const finalTasks: Task[] = suggestedTasks.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      title: t.title,
      description: t.description,
      points: t.points,
      category: t.category,
      priority: t.priority,
      status: "À faire",
      suggestedPartner: t.suggestedPartner,
      assignedTo: t.assignedTo,
      createdBy: currentPartner.name,
      createdAt: new Date().toISOString(),
      relatedNeed: t.relatedNeed
    }));

    onTasksAdded(finalTasks);
    onNeedLogged(needText, finalTasks.length);

    // Reset Form
    setNeedText("");
    setSuggestedTasks([]);
    setAiNote(null);
  };

  const handleCancelPreview = () => {
    setSuggestedTasks([]);
    setAiNote(null);
  };

  return (
    <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm" id="post-need-form">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-2xl bg-natural-sage/20 text-natural-olive">
          <Sparkles className="w-5 h-5 fill-natural-olive/20" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-natural-text text-xl">Exprimer un besoin / fatigue</h2>
          <p className="text-xs text-natural-text/70 mt-0.5">Exprimez-vous librement en langage naturel, l'IA s'occupe de planifier pour vous deux !</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {suggestedTasks.length === 0 ? (
          <motion.form 
            key="input-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleAnalyze} 
            className="space-y-4"
          >
            {/* Needs text input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-natural-accent mb-2">Quel est votre besoin en temps réel ?</label>
              <textarea
                id="need-input-textarea"
                rows={3}
                value={needText}
                onChange={(e) => setNeedText(e.target.value)}
                placeholder="Ex: 'Je suis très fatiguée ce soir, j'aimerais bien qu'on s'occupe du bain du petit et de faire les courses pour demain...'"
                className="w-full text-sm border border-natural-line rounded-2xl p-4 focus:ring-2 focus:ring-natural-olive focus:border-natural-olive outline-none transition placeholder:text-natural-accent/50 bg-natural-bg/50 resize-none leading-relaxed text-natural-text"
                disabled={loading}
              />
            </div>

            {/* Quick Helper Suggestions */}
            <div>
              <span className="block text-[11px] font-bold text-natural-accent/80 uppercase tracking-wider mb-2">Exemples rapides à tester :</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    id={`btn-example-${idx}`}
                    onClick={() => handleExampleClick(ex.text)}
                    className="text-xs px-3 py-2 rounded-xl border border-natural-line hover:border-natural-accent/40 hover:bg-natural-bg text-natural-text/90 hover:text-natural-olive transition font-medium"
                    disabled={loading}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-natural-terracotta/10 text-natural-terracotta rounded-2xl text-xs flex items-center gap-2 border border-natural-terracotta/20">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Trigger Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="btn-submit-analyze"
                disabled={loading || !needText.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition shadow ${
                  loading || !needText.trim()
                    ? "bg-natural-line text-natural-accent/50 cursor-not-allowed shadow-none"
                    : "bg-natural-terracotta hover:bg-natural-terracotta/95 hover:shadow active:scale-95 cursor-pointer"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    Décomposer avec l'IA
                  </>
                )}
              </button>
            </div>
          </motion.form>
        ) : (
          /* Task preview step */
          <motion.div
            key="preview-tasks"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Header banner */}
            <div className="bg-natural-sage/20 border border-natural-sage/30 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h4 className="text-sm font-bold text-natural-olive">Assistance IA de Charge Mentale</h4>
                <p className="text-xs text-natural-olive/90 mt-0.5">
                  {aiNote || "Voici une répartition bienveillante proposée à partir de votre besoin."}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {suggestedTasks.map((task, index) => {
                const otherPartner = partners.find(p => p.id !== currentPartner.id);
                return (
                  <div key={index} className="border border-natural-line rounded-2xl p-4 bg-natural-bg/40 space-y-3 relative group">
                    {/* Delete item */}
                    <button
                      onClick={() => handleDeleteSuggested(index)}
                      className="absolute right-3 top-3 p-1 text-natural-accent/50 hover:text-natural-terracotta rounded-lg hover:bg-natural-terracotta/10 transition"
                      title="Supprimer cette suggestion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Task editable details */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Title input */}
                      <div className="sm:col-span-8 text-left">
                        <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Intitulé de la tâche</label>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleModifyTask(index, "title", e.target.value)}
                          className="w-full text-sm border border-natural-line rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-natural-olive outline-none bg-natural-panel font-medium text-natural-text"
                        />
                      </div>
                      
                      {/* Points input */}
                      <div className="sm:col-span-4 text-left">
                        <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Points 🌱</label>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={task.points}
                          onChange={(e) => handleModifyTask(index, "points", parseInt(e.target.value) || 15)}
                          className="w-full text-sm border border-natural-line rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-natural-olive outline-none bg-natural-panel text-center font-bold text-natural-olive"
                        />
                      </div>
                    </div>

                    {/* Description input */}
                    <div className="text-left">
                      <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Description / Comment faire</label>
                      <input
                        type="text"
                        value={task.description}
                        onChange={(e) => handleModifyTask(index, "description", e.target.value)}
                        className="w-full text-xs border border-natural-line rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-natural-olive outline-none bg-natural-panel text-natural-text/80"
                      />
                    </div>

                    {/* Row of dropdowns for Category, Priority, Assignee */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-left">
                      {/* Category */}
                      <div>
                        <label className="block text-[9px] font-bold text-natural-accent uppercase mb-1">Thème</label>
                        <select
                          value={task.category}
                          onChange={(e) => handleModifyTask(index, "category", e.target.value as TaskCategory)}
                          className="w-full text-xs border border-natural-line rounded-lg px-2 py-1 outline-none bg-natural-panel text-natural-text"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-[9px] font-bold text-natural-accent uppercase mb-1">Priorité</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleModifyTask(index, "priority", e.target.value as TaskPriority)}
                          className="w-full text-xs border border-natural-line rounded-lg px-2 py-1 outline-none bg-natural-panel text-natural-text"
                        >
                          {PRIORITIES.map(pri => <option key={pri} value={pri}>{pri}</option>)}
                        </select>
                      </div>

                      {/* Suggested Assignee */}
                      <div>
                        <label className="block text-[9px] font-bold text-natural-accent uppercase mb-1">Assigné à</label>
                        <select
                          value={task.assignedTo || ""}
                          onChange={(e) => handleModifyTask(index, "assignedTo", e.target.value || null)}
                          className="w-full text-xs border border-natural-line rounded-lg px-2 py-1 outline-none bg-natural-panel text-natural-text"
                        >
                          <option value="">Libre</option>
                          <option value={currentPartner.name}>{currentPartner.name} (Moi)</option>
                          {otherPartner && <option value={otherPartner.name}>{otherPartner.name}</option>}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons inside suggestion mode */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddTaskSuggestion}
                className="flex items-center gap-1.5 text-xs text-natural-olive font-bold hover:text-natural-olive/80 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une tâche personnalisée
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  className="px-4 py-2 text-xs font-semibold text-natural-accent hover:text-natural-text hover:bg-natural-bg rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCommitTasks}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-natural-terracotta hover:bg-natural-terracotta/90 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <Check className="w-4 h-4" />
                  Valider et planifier ({suggestedTasks.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
