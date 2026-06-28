import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Heart, 
  TrendingUp, 
  Award, 
  Settings, 
  CheckCircle, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Info,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { Task, Partner, Reward } from "../types";

interface MainDashboardProps {
  tasks: Task[];
  partners: Partner[];
  rewards: Reward[];
  onNavigateToTab: (tabId: "planning" | "dashboard" | "rewards" | "needs") => void;
}

type WidgetType = "pie" | "points" | "rewards" | "load";

export default function MainDashboard({ tasks, partners, rewards, onNavigateToTab }: MainDashboardProps) {
  // --- STATE FOR CUSTOMIZATION ---
  const [showSettings, setShowSettings] = useState(false);
  const [layoutOrder, setLayoutOrder] = useState<WidgetType[]>(() => {
    const saved = localStorage.getItem("equihome_dashboard_layout_order");
    return saved ? JSON.parse(saved) : ["pie", "points", "rewards", "load"];
  });
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetType, boolean>>(() => {
    const saved = localStorage.getItem("equihome_dashboard_visible_widgets");
    return saved ? JSON.parse(saved) : { pie: true, points: true, rewards: true, load: true };
  });
  const [featuredWidget, setFeaturedWidget] = useState<WidgetType | null>(() => {
    const saved = localStorage.getItem("equihome_dashboard_featured_widget");
    return saved ? JSON.parse(saved) : "pie";
  });

  // Save preferences to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem("equihome_dashboard_layout_order", JSON.stringify(layoutOrder));
  }, [layoutOrder]);

  useEffect(() => {
    localStorage.setItem("equihome_dashboard_visible_widgets", JSON.stringify(visibleWidgets));
  }, [visibleWidgets]);

  useEffect(() => {
    localStorage.setItem("equihome_dashboard_featured_widget", JSON.stringify(featuredWidget));
  }, [featuredWidget]);

  // --- STATS CALCULATIONS ---
  const completedTasks = tasks.filter(t => t.status === "Terminé");
  const p1Name = partners[0]?.name || "Partenaire 1";
  const p2Name = partners[1]?.name || "Partenaire 2";

  const p1CompletedCount = completedTasks.filter(t => t.assignedTo === p1Name).length;
  const p2CompletedCount = completedTasks.filter(t => t.assignedTo === p2Name).length;
  const totalCompleted = p1CompletedCount + p2CompletedCount;

  const p1Percent = totalCompleted > 0 ? Math.round((p1CompletedCount / totalCompleted) * 100) : 0;
  const p2Percent = totalCompleted > 0 ? Math.round((p2CompletedCount / totalCompleted) * 100) : 0;

  // Pie chart data
  const chartData = totalCompleted > 0 ? [
    { name: p1Name, value: p1CompletedCount, color: "#5B6344" }, // olive
    { name: p2Name, value: p2CompletedCount, color: "#B86B5A" }  // terracotta
  ] : [
    { name: "Aucune tâche faite", value: 1, color: "#E6E4D9" }   // line placeholder
  ];

  // Recently unlocked rewards
  const unlockedRewards = rewards.filter(r => r.unlockedBy !== null);

  // Mental Load Metrics (points value of assigned pending/completed tasks)
  const getPartnerLoadScore = (partnerName: string) => {
    return tasks
      .filter(t => t.assignedTo === partnerName)
      .reduce((sum, t) => sum + t.points, 0);
  };

  const p1LoadScore = getPartnerLoadScore(p1Name);
  const p2LoadScore = getPartnerLoadScore(p2Name);
  const totalLoadScore = p1LoadScore + p2LoadScore;
  const p1LoadPercent = totalLoadScore > 0 ? Math.round((p1LoadScore / totalLoadScore) * 100) : 50;
  const p2LoadPercent = totalLoadScore > 0 ? Math.round((p2LoadScore / totalLoadScore) * 100) : 50;

  // Customization controls
  const handleToggleWidget = (id: WidgetType) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...layoutOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setLayoutOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === layoutOrder.length - 1) return;
    const newOrder = [...layoutOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setLayoutOrder(newOrder);
  };

  const handleResetCustomization = () => {
    setLayoutOrder(["pie", "points", "rewards", "load"]);
    setVisibleWidgets({ pie: true, points: true, rewards: true, load: true });
    setFeaturedWidget("pie");
  };

  // --- RENDERING INDIVIDUAL COMPONENTS ---
  
  // 1. REPARTITION DES TACHES WIDGET (PIE CHART)
  const renderPieWidget = (isFeatured: boolean = false) => {
    return (
      <div className={`bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm flex flex-col justify-between ${isFeatured ? "col-span-full border-2 border-natural-sage/50" : ""}`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-natural-accent">Statistiques d'Actions</span>
            <span className="px-2 py-0.5 rounded-md bg-natural-sage/10 text-natural-olive text-[10px] font-bold">Complétées</span>
          </div>
          <h3 className="font-serif font-bold text-natural-text text-xl">Répartition des Corvées Terminées</h3>
          <p className="text-xs text-natural-accent mt-1">Comparaison des corvées effectivement réalisées par chaque partenaire</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-6">
          <div className="md:col-span-7 flex justify-center relative">
            <div className="w-full h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} tâche${Number(value) > 1 ? 's' : ''}`, 
                      name
                    ]}
                    contentStyle={{ 
                      backgroundColor: "#F9F8F3", 
                      border: "1px solid #E6E4D9", 
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#2F3E46"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Centered overall completion metric */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-natural-accent block">Total</span>
              <span className="font-serif font-bold text-3xl text-natural-text">{totalCompleted}</span>
              <span className="text-[10px] text-natural-accent block">faites</span>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <div className="bg-natural-bg/50 border border-natural-line rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-natural-olive inline-block"></span>
                  <span className="font-semibold text-natural-text">{p1Name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-natural-text block">{p1CompletedCount} corvée{p1CompletedCount > 1 ? 's' : ''}</span>
                  <span className="text-[10px] font-bold text-natural-olive block">{p1Percent}%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-natural-line rounded-full overflow-hidden">
                <div className="h-full bg-natural-olive" style={{ width: `${p1Percent}%` }}></div>
              </div>
            </div>

            <div className="bg-natural-bg/50 border border-natural-line rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-natural-terracotta inline-block"></span>
                  <span className="font-semibold text-natural-text">{p2Name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-natural-text block">{p2CompletedCount} corvée{p2CompletedCount > 1 ? 's' : ''}</span>
                  <span className="text-[10px] font-bold text-natural-terracotta block">{p2Percent}%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-natural-line rounded-full overflow-hidden">
                <div className="h-full bg-natural-terracotta" style={{ width: `${p2Percent}%` }}></div>
              </div>
            </div>

            {totalCompleted === 0 && (
              <p className="text-[10.5px] text-natural-terracotta italic text-center font-medium">
                💡 Terminez une corvée dans "Planning & IA" pour activer les statistiques !
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-natural-line/60 mt-4 flex items-center justify-between">
          <span className="text-[10px] text-natural-accent">Mis à jour en temps réel</span>
          <button 
            onClick={() => onNavigateToTab("planning")} 
            className="text-xs font-bold text-natural-olive hover:text-natural-olive/80 flex items-center gap-1 transition"
          >
            Planning des corvées
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // 2. SOLDE DE POINTS WIDGET
  const renderPointsWidget = (isFeatured: boolean = false) => {
    return (
      <div className={`bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm flex flex-col justify-between ${isFeatured ? "col-span-full border-2 border-natural-sage/50" : ""}`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-natural-accent">Porte-monnaie du Couple</span>
            <span className="px-2 py-0.5 rounded-md bg-natural-terracotta/10 text-natural-terracotta text-[10px] font-bold">Cagnottes</span>
          </div>
          <h3 className="font-serif font-bold text-natural-text text-xl">Points & Récompenses Disponibles</h3>
          <p className="text-xs text-natural-accent mt-1">Vos points accumulés en gérant l'organisation de la maison</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {partners.map((partner, idx) => {
            const nextGoal = 100;
            const progress = Math.min(Math.round((partner.points / nextGoal) * 100), 100);
            return (
              <div 
                key={partner.id} 
                className="bg-natural-bg/40 border border-natural-line rounded-2xl p-5 flex flex-col justify-between hover:border-natural-accent/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-natural-panel border border-natural-line flex items-center justify-center text-lg">
                      {partner.avatarSeed}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-natural-text text-base">{partner.name}</h4>
                      <p className="text-[10px] text-natural-accent">{partner.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-natural-accent block">Cumul</span>
                    <span className="text-xs font-bold text-natural-olive">🏆 {partner.totalPointsEarned} pts</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-natural-accent">Solde actuel</span>
                    <span className="font-serif font-bold text-2xl text-natural-terracotta">🌱 {partner.points} pts</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-natural-accent font-bold">
                      <span>Progrès objectif cadeau</span>
                      <span>{partner.points} / {nextGoal} pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-natural-line rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${idx === 0 ? "bg-natural-olive" : "bg-natural-terracotta"}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-natural-line/60 flex items-center justify-between">
          <span className="text-[10px] text-natural-accent">Collectez des points via vos corvées</span>
          <button 
            onClick={() => onNavigateToTab("rewards")} 
            className="text-xs font-bold text-natural-olive hover:text-natural-olive/80 flex items-center gap-1 transition"
          >
            Visiter la boutique
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // 3. RECEMMENT DEBLOQUE WIDGET
  const renderRewardsWidget = (isFeatured: boolean = false) => {
    return (
      <div className={`bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm flex flex-col justify-between ${isFeatured ? "col-span-full border-2 border-natural-sage/50" : ""}`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-natural-accent">Moments Complices</span>
            <span className="px-2 py-0.5 rounded-md bg-natural-olive/15 text-natural-olive text-[10px] font-bold">Débloqué</span>
          </div>
          <h3 className="font-serif font-bold text-natural-text text-xl">Récompenses Récemment S'offertes</h3>
          <p className="text-xs text-natural-accent mt-1">Cadeaux et privilèges activés par l'un des partenaires</p>
        </div>

        <div className="my-6 space-y-3 flex-1 min-h-[140px] flex flex-col justify-center">
          {unlockedRewards.length > 0 ? (
            unlockedRewards.slice(-3).map(reward => {
              const claimer = partners.find(p => p.name === reward.unlockedBy);
              return (
                <div 
                  key={reward.id} 
                  className="flex items-center justify-between p-3.5 bg-natural-bg/50 border border-natural-line rounded-2xl gap-3 text-left hover:bg-natural-bg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-natural-sage/20 text-natural-olive">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-natural-text">{reward.title}</h4>
                      <p className="text-[10.5px] text-natural-accent line-clamp-1">{reward.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-natural-olive bg-natural-sage/10 px-2 py-0.5 rounded-md border border-natural-sage/20">
                      🎁 Offert à {reward.unlockedBy}
                    </span>
                    <span className="block text-[9px] text-natural-accent mt-0.5">
                      🌱 {reward.costPoints} points déduits
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 border border-dashed border-natural-line rounded-2xl bg-natural-bg/20">
              <Award className="w-8 h-8 text-natural-accent/40 mx-auto mb-2 stroke-1" />
              <p className="text-xs text-natural-accent italic">Aucune récompense débloquée pour le moment.</p>
              <p className="text-[10px] text-natural-accent/85 mt-1">Faites vos corvées pour accumuler des points et vous faire plaisir !</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-natural-line/60 flex items-center justify-between">
          <span className="text-[10px] text-natural-accent">{unlockedRewards.length} récompense{unlockedRewards.length > 1 ? 's' : ''} débloquée{unlockedRewards.length > 1 ? 's' : ''}</span>
          <button 
            onClick={() => onNavigateToTab("rewards")} 
            className="text-xs font-bold text-natural-olive hover:text-natural-olive/80 flex items-center gap-1 transition"
          >
            S'offrir un cadeau
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // 4. BAROMETRE D'EQUILIBRE / CHARGE MENTALE WIDGET
  const renderLoadWidget = (isFeatured: boolean = false) => {
    // Analyze dynamic load balance feedback
    let feedbackMsg = "🌱 Équilibre parfait ! Les énergies et la charge de travail s'accordent en symbiose.";
    let feedbackColor = "bg-natural-sage/20 border-natural-sage/30 text-natural-olive";

    if (p1LoadPercent >= 65) {
      feedbackMsg = `⚠️ Attention, ${p1Name} porte la majeure partie de la charge mentale (${p1LoadPercent}%).`;
      feedbackColor = "bg-natural-terracotta/10 border-natural-terracotta/20 text-natural-terracotta";
    } else if (p2LoadPercent >= 65) {
      feedbackMsg = `⚠️ Attention, ${p2Name} porte la majeure partie de la charge mentale (${p2LoadPercent}%).`;
      feedbackColor = "bg-natural-terracotta/10 border-natural-terracotta/20 text-natural-terracotta";
    }

    return (
      <div className={`bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm flex flex-col justify-between ${isFeatured ? "col-span-full border-2 border-natural-sage/50" : ""}`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-natural-accent">Indice d'Équité</span>
            <span className="px-2 py-0.5 rounded-md bg-natural-olive/15 text-natural-olive text-[10px] font-bold">Baromètre</span>
          </div>
          <h3 className="font-serif font-bold text-natural-text text-xl">Balance de la Charge Mentale</h3>
          <p className="text-xs text-natural-accent mt-1">Calculée selon le poids en points de toutes les corvées actives ou planifiées</p>
        </div>

        <div className="my-6 space-y-5">
          <div className="flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="font-serif font-bold text-natural-text block">{p1Name}</span>
              <span className="text-[11px] text-natural-olive font-extrabold">{p1LoadPercent}% ({p1LoadScore} pts)</span>
            </div>
            
            <div className="text-right">
              <span className="font-serif font-bold text-natural-text block">{p2Name}</span>
              <span className="text-[11px] text-natural-terracotta font-extrabold">{p2LoadPercent}% ({p2LoadScore} pts)</span>
            </div>
          </div>

          {/* Graphical slider gauge */}
          <div className="relative w-full h-4 bg-natural-bg border border-natural-line/40 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-natural-sage transition-all duration-700 ease-out"
              style={{ width: `${p1LoadPercent}%` }}
            ></div>
            <div 
              className="h-full bg-natural-accent transition-all duration-700 ease-out"
              style={{ width: `${p2LoadPercent}%` }}
            ></div>
            
            {/* Center pointer */}
            <div className="absolute left-1/2 top-0 -ml-0.5 w-1 h-full bg-white/95 border-r border-natural-line shadow-inner"></div>
          </div>

          <div className={`p-4 rounded-2xl border text-xs text-left leading-relaxed ${feedbackColor}`}>
            <p className="font-bold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 shrink-0 fill-current" />
              {feedbackMsg}
            </p>
            {Math.abs(p1LoadPercent - p2LoadPercent) >= 20 && (
              <p className="mt-1 opacity-90 text-[10.5px]">
                Prenez quelques minutes pour discuter de l'attribution des prochaines corvées avec l'aide de l'IA pour équilibrer la balance !
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-natural-line/60 flex items-center justify-between">
          <span className="text-[10px] text-natural-accent">Indicateur calculé sur {tasks.length} corvée{tasks.length > 1 ? 's' : ''}</span>
          <button 
            onClick={() => onNavigateToTab("dashboard")} 
            className="text-xs font-bold text-natural-olive hover:text-natural-olive/80 flex items-center gap-1 transition"
          >
            Statistiques détaillées
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderWidget = (type: WidgetType, isFeatured: boolean = false) => {
    switch (type) {
      case "pie":
        return renderPieWidget(isFeatured);
      case "points":
        return renderPointsWidget(isFeatured);
      case "rewards":
        return renderRewardsWidget(isFeatured);
      case "load":
        return renderLoadWidget(isFeatured);
      default:
        return null;
    }
  };

  const getWidgetLabel = (type: WidgetType) => {
    switch (type) {
      case "pie":
        return "📊 Graphique de répartition des tâches";
      case "points":
        return "🌱 Cagnottes de points";
      case "rewards":
        return "🎁 Récompenses récemment débloquées";
      case "load":
        return "⚖️ Balance de charge mentale";
    }
  };

  return (
    <div className="space-y-6" id="custom-main-dashboard">
      
      {/* 🛠️ CUSTOMIZATION PANEL CONTROL BAR */}
      <div className="bg-natural-panel border border-natural-line rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-xl bg-natural-sage/20 text-natural-olive">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-natural-text">Tableau de Bord Personnalisé</h2>
            <p className="text-xs text-natural-accent">Configurez l'ordre et la visibilité de vos indicateurs favoris</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-toggle-dashboard-settings"
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 text-xs font-bold bg-natural-bg hover:bg-natural-line border border-natural-line rounded-xl text-natural-text transition flex items-center gap-1.5"
          >
            <span>⚙️ {showSettings ? "Masquer les réglages" : "Personnaliser l'affichage"}</span>
          </button>
        </div>
      </div>

      {/* 🔧 SETTINGS DROPDOWN / ACCORDION PANEL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm space-y-6 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-natural-line">
                <span className="text-sm font-bold text-natural-text flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-natural-olive" />
                  Paramètres de mise en page & focus
                </span>
                <button
                  onClick={handleResetCustomization}
                  className="text-[11px] font-bold text-natural-terracotta hover:underline"
                >
                  🔄 Réinitialiser les réglages
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Show/Hide & Feature Metric Selection */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-natural-accent uppercase tracking-wider">
                    Visibilité & Focus Principal
                  </h4>
                  <p className="text-xs text-natural-accent/90">
                    Sélectionnez les indicateurs à inclure et choisissez-en un à mettre en avant au format géant à la une.
                  </p>

                  <div className="space-y-2">
                    {layoutOrder.map(type => {
                      const isVisible = visibleWidgets[type];
                      const isFeatured = featuredWidget === type;

                      return (
                        <div 
                          key={type} 
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            isVisible ? "bg-natural-bg/30 border-natural-line" : "bg-natural-bg/10 border-dashed border-natural-line/60 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              onClick={() => handleToggleWidget(type)}
                              className="text-natural-accent hover:text-natural-text"
                              title={isVisible ? "Masquer l'indicateur" : "Afficher l'indicateur"}
                            >
                              {isVisible ? <Eye className="w-4.5 h-4.5 text-natural-olive" /> : <EyeOff className="w-4.5 h-4.5 text-natural-accent/60" />}
                            </button>
                            <span className="font-semibold text-natural-text">{getWidgetLabel(type).substring(3)}</span>
                          </div>

                          {isVisible && (
                            <button
                              onClick={() => setFeaturedWidget(isFeatured ? null : type)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                isFeatured 
                                  ? "bg-natural-olive text-white" 
                                  : "bg-natural-bg text-natural-accent hover:bg-natural-line"
                              }`}
                            >
                              {isFeatured ? "⭐ Mis en avant" : "Mettre en avant"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Reorder metrics via simple arrow sliders */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-natural-accent uppercase tracking-wider">
                    Ordre d'apparition
                  </h4>
                  <p className="text-xs text-natural-accent/90">
                    Déterminez l'ordre des blocs du tableau de bord à l'aide des flèches directionnelles de tri.
                  </p>

                  <div className="space-y-2">
                    {layoutOrder.map((type, idx) => {
                      return (
                        <div 
                          key={type} 
                          className="flex items-center justify-between p-3 bg-natural-bg/30 border border-natural-line rounded-xl text-xs"
                        >
                          <span className="font-semibold text-natural-text">{getWidgetLabel(type)}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className={`p-1 rounded hover:bg-natural-line transition ${idx === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                            >
                              <ChevronUp className="w-4 h-4 text-natural-text" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === layoutOrder.length - 1}
                              className={`p-1 rounded hover:bg-natural-line transition ${idx === layoutOrder.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                            >
                              <ChevronDown className="w-4 h-4 text-natural-text" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 FEATURED SPOTLIGHT WIDGET BOX */}
      {featuredWidget && visibleWidgets[featuredWidget] && (
        <motion.div
          layoutId="featured-spotlight-box"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-full"
        >
          <div className="relative overflow-hidden rounded-3xl">
            {/* Spotlight label border */}
            <div className="absolute top-0 left-0 bg-natural-olive text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-br-2xl rounded-tl-3xl z-10 flex items-center gap-1.5 shadow">
              <Zap className="w-3.5 h-3.5 fill-current text-natural-sage" />
              <span>A la une de vos priorités</span>
            </div>
            {renderWidget(featuredWidget, true)}
          </div>
        </motion.div>
      )}

      {/* 📊 CORE WIDGETS DYNAMIC GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {layoutOrder
          .filter(type => visibleWidgets[type] && type !== featuredWidget)
          .map(type => (
            <motion.div
              layout
              key={`dashboard-widget-${type}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex"
            >
              <div className="w-full flex">
                {renderWidget(type)}
              </div>
            </motion.div>
          ))}
      </div>

      {/* If all widgets are hidden, show fallback */}
      {Object.values(visibleWidgets).every(v => !v) && (
        <div className="bg-natural-panel border border-natural-line rounded-3xl p-12 text-center text-natural-accent">
          <Layers className="w-12 h-12 text-natural-line mx-auto mb-3 stroke-1" />
          <h4 className="font-serif font-bold text-natural-text text-xl">Tableau de bord vide</h4>
          <p className="text-sm text-natural-accent mt-1 max-w-sm mx-auto">
            Vous avez désactivé tous les indicateurs. Ouvrez le panneau de personnalisation pour réactiver les blocs de votre choix !
          </p>
          <button
            onClick={handleResetCustomization}
            className="mt-4 px-5 py-2.5 bg-natural-olive text-white rounded-xl text-xs font-bold hover:bg-natural-olive/90 transition"
          >
            Activer tous les modules
          </button>
        </div>
      )}
    </div>
  );
}
