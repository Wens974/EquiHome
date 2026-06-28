import React, { useState, FormEvent } from "react";
import { Reward, Partner } from "../types";
import { 
  Award, 
  Moon, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldAlert, 
  Beer, 
  Tv, 
  Plus, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface RewardStoreProps {
  rewards: Reward[];
  currentPartner: Partner;
  onClaimReward: (rewardId: string) => void;
  onAddReward: (title: string, description: string, costPoints: number, iconName: string) => void;
}

const REWARD_ICONS: Record<string, any> = {
  Moon: Moon,
  UtensilsCrossed: UtensilsCrossed,
  Sparkles: Sparkles,
  ShieldAlert: ShieldAlert,
  Beer: Beer,
  Tv: Tv,
};

const ICON_OPTIONS = [
  { name: "Moon", label: "Dodo / Repos 😴" },
  { name: "UtensilsCrossed", label: "Repas / Gastronomie 🍳" },
  { name: "Sparkles", label: "Massage / Bien-être 💆" },
  { name: "Beer", label: "Sortie / Verre 🍻" },
  { name: "Tv", label: "Détente / Écran 📺" },
  { name: "ShieldAlert", label: "Joker / Aide 🛡️" }
];

export default function RewardStore({ rewards, currentPartner, onClaimReward, onAddReward }: RewardStoreProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCost, setNewCost] = useState(50);
  const [newIcon, setNewIcon] = useState("Sparkles");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || newCost <= 0) return;

    onAddReward(newTitle, newDesc, newCost, newIcon);
    setNewTitle("");
    setNewDesc("");
    setNewCost(50);
    setNewIcon("Sparkles");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="reward-store">
      {/* Balance Indicator Header */}
      <div className="bg-natural-olive text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        {/* Abstract graphics */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute left-10 bottom-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-natural-sage font-bold">Votre cagnotte personnelle</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-4xl font-bold text-natural-bg">🌱 {currentPartner.points}</span>
              <span className="text-sm text-natural-sage">points disponibles</span>
            </div>
            <p className="text-xs text-white/90 mt-2 leading-relaxed">
              Cumulez des points en effectuant les corvées et tâches du quotidien pour vous offrir des moments de détente bien mérités.
            </p>
          </div>
          
          <button
            id="btn-toggle-add-reward"
            onClick={() => setShowAddForm(!showAddForm)}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold transition-all text-white"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Voir les récompenses" : "Proposer une récompense"}
          </button>
        </div>
      </div>

      {showAddForm ? (
        /* Create Reward Form */
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm space-y-4"
          id="add-reward-form"
        >
          <h3 className="font-serif font-bold text-natural-text text-xl">Proposer une nouvelle récompense pour le couple</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-left">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-natural-accent uppercase tracking-wider mb-2">Titre de la récompense</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Soirée ciné en tête-à-tête 🎬"
                className="w-full text-sm border border-natural-line rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-natural-olive outline-none bg-natural-panel text-natural-text"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-natural-accent uppercase tracking-wider mb-2">Coût en points 🌱</label>
              <input
                type="number"
                min={10}
                max={500}
                value={newCost}
                onChange={(e) => setNewCost(parseInt(e.target.value) || 50)}
                className="w-full text-sm border border-natural-line rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-natural-olive outline-none font-bold text-natural-terracotta bg-natural-panel"
                required
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-natural-accent uppercase tracking-wider mb-2">Description</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ex: Le partenaire prépare le pop-corn, choisit le film et s'occupe de coucher les enfants..."
              className="w-full text-sm border border-natural-line rounded-xl p-4 focus:ring-1 focus:ring-natural-olive outline-none resize-none bg-natural-panel text-natural-text"
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-natural-accent uppercase tracking-wider mb-2">Type d'icône</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ICON_OPTIONS.map(opt => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setNewIcon(opt.name)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition ${
                    newIcon === opt.name
                      ? "bg-natural-sage/20 border-natural-sage text-natural-olive font-bold"
                      : "border-natural-line hover:border-natural-accent/40 text-natural-text"
                  }`}
                >
                  <span className="text-base">
                    {opt.name === "Moon" && "😴"}
                    {opt.name === "UtensilsCrossed" && "🍳"}
                    {opt.name === "Sparkles" && "💆"}
                    {opt.name === "Beer" && "🍻"}
                    {opt.name === "Tv" && "📺"}
                    {opt.name === "ShieldAlert" && "🛡️"}
                  </span>
                  {opt.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-natural-line">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-natural-accent hover:text-natural-text hover:bg-natural-bg rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="btn-submit-reward"
              className="px-5 py-2.5 bg-natural-terracotta hover:bg-natural-terracotta/90 text-white rounded-xl text-xs font-bold shadow"
            >
              Ajouter la récompense
            </button>
          </div>
        </motion.form>
      ) : (
        /* Rewards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {rewards.map(reward => {
            const IconComponent = REWARD_ICONS[reward.iconName] || Sparkles;
            const isUnlocked = reward.unlockedBy !== null;
            const canAfford = currentPartner.points >= reward.costPoints;

            return (
              <div
                key={reward.id}
                id={`reward-card-${reward.id}`}
                className={`border rounded-2xl p-5 bg-natural-panel border-natural-line shadow-sm flex flex-col justify-between transition-all relative overflow-hidden ${
                  isUnlocked ? "opacity-75 bg-natural-bg/40 border-dashed" : "hover:shadow-md"
                }`}
              >
                {/* Visual Unlocked Sticker */}
                {isUnlocked && (
                  <div className="absolute top-3 right-3 rotate-12 bg-natural-sage/20 text-natural-olive text-[10px] font-bold px-2.5 py-1 rounded-md border border-natural-sage/40 z-10">
                    🔒 Débloqué par {reward.unlockedBy}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isUnlocked ? "bg-natural-bg text-natural-accent/50" : "bg-natural-terracotta/15 text-natural-terracotta"}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-natural-text text-lg">{reward.title}</h4>
                      <span className="text-xs font-bold text-natural-terracotta flex items-center gap-1 mt-0.5">
                        🌱 {reward.costPoints} points
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-natural-text/80 leading-relaxed pt-1.5">{reward.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-natural-line flex items-center justify-between gap-3">
                  <span className="text-[10px] text-natural-accent/80">
                    {isUnlocked ? "Délivré & Consommé" : `Niveau d'accès : Tout couple`}
                  </span>

                  {!isUnlocked ? (
                    <button
                      id={`btn-unlock-reward-${reward.id}`}
                      disabled={!canAfford}
                      onClick={() => onClaimReward(reward.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        canAfford
                          ? "bg-natural-terracotta hover:bg-natural-terracotta/90 text-white shadow-sm active:scale-95 cursor-pointer"
                          : "bg-natural-bg border border-natural-line text-natural-accent/40 cursor-not-allowed"
                      }`}
                      title={canAfford ? "S'offrir cette récompense" : "Points insuffisants"}
                    >
                      🎁 S'offrir
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-natural-olive font-bold">
                      <CheckCircle className="w-4 h-4 text-natural-sage" />
                      <span>Profitez-en bien !</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
