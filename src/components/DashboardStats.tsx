import { Task, Partner } from "../types";
import { 
  Award, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  Home,
  Utensils,
  Baby,
  FileText,
  ShoppingCart,
  Scissors,
  HelpCircle
} from "lucide-react";

interface DashboardStatsProps {
  tasks: Task[];
  partners: Partner[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Ménage: "bg-natural-sage",
  Cuisine: "bg-natural-terracotta",
  Enfants: "bg-natural-accent",
  Administratif: "bg-natural-olive",
  Courses: "bg-natural-terracotta",
  Animaux: "bg-natural-accent",
  Autre: "bg-natural-text"
};

export default function DashboardStats({ tasks, partners }: DashboardStatsProps) {
  // Calculate completed tasks, total points
  const p1 = partners[0];
  const p2 = partners[1];

  const totalCompleted = tasks.filter(t => t.status === "Terminé").length;
  const totalPending = tasks.filter(t => t.status !== "Terminé").length;

  // Let's count points and tasks per partner (for pending + completed)
  // To check "repartition of tasks", let's look at either active assigned pending tasks or total completed tasks
  const p1PendingCount = tasks.filter(t => t.status !== "Terminé" && t.assignedTo === p1.name).length;
  const p2PendingCount = tasks.filter(t => t.status !== "Terminé" && t.assignedTo === p2.name).length;

  const p1CompletedCount = tasks.filter(t => t.status === "Terminé" && t.assignedTo === p1.name).length;
  const p2CompletedCount = tasks.filter(t => t.status === "Terminé" && t.assignedTo === p2.name).length;

  // Calculate repartition percentage based on active responsibility (assigned pending + completed)
  const p1LoadScore = tasks.filter(t => t.assignedTo === p1.name).reduce((sum, t) => sum + t.points, 0);
  const p2LoadScore = tasks.filter(t => t.assignedTo === p2.name).reduce((sum, t) => sum + t.points, 0);
  
  const totalLoadScore = p1LoadScore + p2LoadScore;
  const p1Percent = totalLoadScore > 0 ? Math.round((p1LoadScore / totalLoadScore) * 100) : 50;
  const p2Percent = totalLoadScore > 0 ? 100 - p1Percent : 50;

  // Analyze load balance
  let statusMessage = "🌱 Parfaitement équilibré ! Vos énergies s'accordent en harmonie.";
  let statusColor = "bg-natural-sage/20 text-natural-olive border-natural-sage/30";
  let alertMessage = null;

  if (p1Percent >= 65) {
    statusMessage = `⚠️ Surcharge mentale détectée pour ${p1.name}.`;
    statusColor = "bg-natural-terracotta/15 text-natural-terracotta border border-natural-terracotta/20";
    alertMessage = `${p2.name}, tu pourrais soulager ${p1.name} en prenant en charge l'une des tâches libres ou suggérées !`;
  } else if (p2Percent >= 65) {
    statusMessage = `⚠️ Surcharge mentale détectée pour ${p2.name}.`;
    statusColor = "bg-natural-terracotta/15 text-natural-terracotta border border-natural-terracotta/20";
    alertMessage = `${p1.name}, tu pourrais soulager ${p2.name} en prenant en charge l'une des tâches libres ou suggérées !`;
  }

  // Count tasks by category
  const categoryCounts: Record<string, number> = {};
  tasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="space-y-6" id="dashboard-stats">
      
      {/* Mental Load Balance Gauge card */}
      <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="text-left">
            <h3 className="font-serif font-bold text-natural-text text-xl">Balance de la Charge Mentale</h3>
            <p className="text-xs text-natural-text/70 mt-0.5">Répartition actuelle basée sur la valeur en points des tâches gérées</p>
          </div>
          <span className="p-2 rounded-xl bg-natural-sage/20 text-natural-olive">
            <TrendingUp className="w-5 h-5" />
          </span>
        </div>

        {/* Visual Barometer */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-end text-sm">
            <div className="flex flex-col items-start">
              <span className="font-serif font-bold text-natural-text text-lg">{p1.name}</span>
              <span className="text-xs text-natural-accent font-medium">{p1PendingCount} en cours • {p1CompletedCount} faites</span>
              <span className="mt-1 text-natural-olive font-extrabold text-lg">{p1Percent}%</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="font-serif font-bold text-natural-text text-lg">{p2.name}</span>
              <span className="text-xs text-natural-accent font-medium">{p2PendingCount} en cours • {p2CompletedCount} faites</span>
              <span className="mt-1 text-natural-terracotta font-extrabold text-lg">{p2Percent}%</span>
            </div>
          </div>

          {/* Bar track representation */}
          <div className="relative w-full h-4 bg-natural-bg border border-natural-line/40 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-natural-sage transition-all duration-700 ease-out"
              style={{ width: `${p1Percent}%` }}
            ></div>
            <div 
              className="h-full bg-natural-accent transition-all duration-700 ease-out"
              style={{ width: `${p2Percent}%` }}
            ></div>
            
            {/* Center balancing point indicator */}
            <div className="absolute left-1/2 top-0 -ml-0.5 w-1 h-full bg-white/80 border-r border-natural-line"></div>
          </div>

          {/* Status feedback bubble */}
          <div className={`p-4 rounded-2xl border text-sm flex items-start gap-3 transition-all duration-300 text-left ${statusColor}`}>
            {p1Percent >= 65 || p2Percent >= 65 ? (
              <AlertTriangle className="w-5 h-5 shrink-0 text-natural-terracotta" />
            ) : (
              <Heart className="w-5 h-5 shrink-0 text-natural-olive fill-natural-sage/10" />
            )}
            <div>
              <p className="font-bold">{statusMessage}</p>
              {alertMessage && (
                <p className="mt-1 text-xs opacity-90 leading-relaxed">{alertMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Partners Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {partners.map((partner, index) => (
          <div 
            key={partner.id} 
            className={`bg-natural-panel border rounded-3xl p-5 shadow-sm transition-all relative overflow-hidden ${
              index === 0 ? "border-natural-sage/30 hover:border-natural-sage" : "border-natural-accent/30 hover:border-natural-accent"
            }`}
          >
            {/* Background design accents */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${
              index === 0 ? "bg-natural-sage" : "bg-natural-accent"
            }`}></div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${partner.avatarColor}`}>
                  {partner.avatarSeed}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-natural-text text-lg">{partner.name}</h4>
                  <p className="text-xs text-natural-accent">{partner.role}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-natural-accent font-bold">Total cumulé</span>
                <p className="font-serif font-bold text-xl text-natural-olive">🏆 {partner.totalPointsEarned} pts</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-natural-line grid grid-cols-2 gap-3 text-center">
              <div className="bg-natural-bg/60 border border-natural-line/50 rounded-xl p-2.5">
                <span className="text-[10px] text-natural-accent block font-bold">Cagnotte Récompense</span>
                <span className="font-bold text-natural-text text-base">🌱 {partner.points} pts</span>
              </div>
              <div className="bg-natural-bg/60 border border-natural-line/50 rounded-xl p-2.5">
                <span className="text-[10px] text-natural-accent block font-bold">Tâches Finies</span>
                <span className="font-bold text-natural-text text-base">🎯 {index === 0 ? p1CompletedCount : p2CompletedCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Household Category Load Distribution */}
      <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="text-left">
            <h3 className="font-serif font-bold text-natural-text text-lg">Charge par Thématique</h3>
            <p className="text-xs text-natural-accent mt-0.5">Fréquence des besoins par type d'activité</p>
          </div>
          <Sparkles className="w-5 h-5 text-natural-olive" />
        </div>

        <div className="space-y-3.5 mt-4 text-left">
          {["Ménage", "Cuisine", "Enfants", "Administratif", "Courses", "Animaux", "Autre"].map(cat => {
            const count = categoryCounts[cat] || 0;
            const barPercent = Math.round((count / maxCategoryCount) * 100);
            
            if (count === 0) return null; // Only show active categories to keep clean

            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs text-natural-text font-medium">
                  <span>{cat}</span>
                  <span className="text-natural-accent font-bold">{count} {count > 1 ? "tâches" : "tâche"}</span>
                </div>
                <div className="w-full h-2 bg-natural-bg border border-natural-line/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${CATEGORY_COLORS[cat] || "bg-natural-text"}`}
                    style={{ width: `${barPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {Object.keys(categoryCounts).length === 0 && (
            <div className="text-center py-6 text-natural-accent text-sm">
              <CheckCircle className="w-8 h-8 mx-auto text-natural-line stroke-1 mb-2" />
              Aucune tâche active dans le planning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
