import React, { useState, useEffect, FormEvent } from "react";
import { Partner, Task, Reward, MentalLoadNeed, TaskCategory, TaskPriority, ChatMessage, NotificationToast } from "./types";
import { 
  INITIAL_PARTNERS, 
  DEFAULT_TASKS, 
  DEFAULT_REWARDS, 
  DEFAULT_NEEDS,
  DEFAULT_MESSAGES
} from "./data";
import TaskCard from "./components/TaskCard";
import DashboardStats from "./components/DashboardStats";
import PostNeedForm from "./components/PostNeedForm";
import RewardStore from "./components/RewardStore";
import MainDashboard from "./components/MainDashboard";
import PremiumModal from "./components/PremiumModal";
import CoupleSyncCard from "./components/CoupleSyncCard";
import CoupleChat from "./components/CoupleChat";

import { 
  Heart, 
  Sparkles, 
  Plus, 
  Award, 
  History, 
  ClipboardList, 
  Users, 
  Settings, 
  Info, 
  Smile, 
  CheckCircle,
  HelpCircle,
  Clock,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  UserCheck,
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
  PanelRightOpen,
  PanelRightClose,
  Check,
  Zap,
  Crown,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // --- STATE PERSISTENCE ---
  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem("equihome_partners");
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("equihome_tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem("equihome_rewards");
    return saved ? JSON.parse(saved) : DEFAULT_REWARDS;
  });

  const [needs, setNeeds] = useState<MentalLoadNeed[]>(() => {
    const saved = localStorage.getItem("equihome_needs");
    return saved ? JSON.parse(saved) : DEFAULT_NEEDS;
  });

  // Current active partner in our dual-profile simulation
  const [currentPartnerId, setCurrentPartnerId] = useState<string>(() => {
    return partners[0]?.id || "p1";
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"summary" | "planning" | "dashboard" | "rewards" | "needs">("summary");

  // Layout presentation states (Sidebar and Quick-Task panel)
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("equihome_sidebar_expanded");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [quickTasksOpen, setQuickTasksOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("equihome_quick_tasks_open");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Persist layout states
  useEffect(() => {
    localStorage.setItem("equihome_sidebar_expanded", JSON.stringify(sidebarExpanded));
  }, [sidebarExpanded]);

  useEffect(() => {
    localStorage.setItem("equihome_quick_tasks_open", JSON.stringify(quickTasksOpen));
  }, [quickTasksOpen]);

  // Filters for domestic tasks list
  const [taskFilter, setTaskFilter] = useState<"Toutes" | "À faire" | "En cours" | "Terminé">("Toutes");
  const [categoryFilter, setCategoryFilter] = useState<string>("Toutes");

  // Manual Task creation states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualPoints, setManualPoints] = useState(20);
  const [manualCategory, setManualCategory] = useState<TaskCategory>("Ménage");
  const [manualPriority, setManualPriority] = useState<TaskPriority>("Moyenne");
  const [manualSuggest, setManualSuggest] = useState<"Auteur" | "Partenaire" | "Libre">("Libre");

  // --- PREMIUM & COUPLE SYNC STATE ---
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    const saved = localStorage.getItem("equihome_premium");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [premiumModalOpen, setPremiumModalOpen] = useState<boolean>(false);

  const [isSynced, setIsSynced] = useState<boolean>(() => {
    const saved = localStorage.getItem("equihome_is_synced");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [syncedPartnerName, setSyncedPartnerName] = useState<string>(() => {
    return localStorage.getItem("equihome_synced_partner_name") || "Thomas";
  });

  const [inviteCode] = useState<string>(() => {
    const saved = localStorage.getItem("equihome_invite_code");
    if (saved) return saved;
    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `EQUI-${rand}-LOVE`;
    localStorage.setItem("equihome_invite_code", code);
    return code;
  });

  useEffect(() => {
    localStorage.setItem("equihome_premium", JSON.stringify(isPremium));
  }, [isPremium]);

  // Handle URL invitation code on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get("invite");
    if (inviteParam && /^EQUI-\d{4}-LOVE$/i.test(inviteParam)) {
      setIsSynced(true);
      localStorage.setItem("equihome_is_synced", "true");
      
      const p1 = partners[0]?.name || "Émilie";
      const p2 = partners[1]?.name || "Thomas";
      const partnerName = currentPartnerId === "p1" ? p2 : p1;
      setSyncedPartnerName(partnerName);
      localStorage.setItem("equihome_synced_partner_name", partnerName);
      
      // Clean query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [partners, currentPartnerId]);

  const handleSync = async (code: string): Promise<boolean> => {
    const regex = /^EQUI-\d{4}-LOVE$/i;
    if (!regex.test(code)) {
      return false;
    }
    setIsSynced(true);
    localStorage.setItem("equihome_is_synced", "true");
    
    const p1 = partners[0]?.name || "Émilie";
    const p2 = partners[1]?.name || "Thomas";
    const partnerName = currentPartnerId === "p1" ? p2 : p1;
    setSyncedPartnerName(partnerName);
    localStorage.setItem("equihome_synced_partner_name", partnerName);
    return true;
  };

  const handleDisconnect = () => {
    setIsSynced(false);
    localStorage.setItem("equihome_is_synced", "false");
  };

  // --- CHAT & NOTIFICATIONS STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("equihome_messages");
    return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  useEffect(() => {
    localStorage.setItem("equihome_messages", JSON.stringify(messages));
  }, [messages]);

  const triggerNotification = (message: string, type: "success" | "info" | "complete" | "need") => {
    const newNotif: NotificationToast = {
      id: `notif-${Date.now()}-${Math.random()}`,
      message,
      type,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Automatically dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentPartner.id,
      senderName: currentPartner.name,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);

    // Send a subtle toast warning to the screen
    triggerNotification(`💬 Message envoyé par ${currentPartner.name}`, "info");

    // Simulate partner response after a brief delay
    setTimeout(() => {
      const partnerObj = partners.find(p => p.id !== currentPartner.id) || partners[0];
      const replies = [
        "Super, merci pour l'info ! 😘",
        "Je m'en occupe dès que je rentre. 👍",
        "Génial ! Tu gères trop. ❤️",
        "On fait comme ça, à ce soir ! 😍",
        "Ouf, merci beaucoup, ça me soulage ! 🙌",
        "Est-ce que tu as besoin d'aide pour autre chose ? 🤔"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: partnerObj.id,
        senderName: partnerObj.name,
        text: randomReply,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, replyMsg]);
      
      // Notify about incoming simulated message
      triggerNotification(`💬 Nouveau message de ${partnerObj.name} : "${randomReply.slice(0, 35)}..."`, "info");
    }, 3500);
  };

  const handleClearHistory = () => {
    if (confirm("Voulez-vous effacer l'historique de discussion ?")) {
      setMessages([]);
    }
  };

  // Helper to calculate daily created tasks count (excluding preseeded ones)
  const getTasksCreatedTodayCount = (): number => {
    const todayStr = new Date().toDateString();
    return tasks.filter(t => {
      if (t.id === "t1" || t.id === "t2" || t.id === "t3" || t.id === "t4") return false;
      if (!t.createdAt) return false;
      return new Date(t.createdAt).toDateString() === todayStr;
    }).length;
  };

  // --- PERSIST EFFECTS ---
  useEffect(() => {
    localStorage.setItem("equihome_partners", JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem("equihome_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("equihome_rewards", JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem("equihome_needs", JSON.stringify(needs));
  }, [needs]);

  // Find active partner object
  const currentPartner = partners.find(p => p.id === currentPartnerId) || partners[0];
  const otherPartner = partners.find(p => p.id !== currentPartnerId);

  // --- HANDLERS FOR TASK INTERACTIONS ---

  const handleClaimTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "En cours" as const,
          assignedTo: currentPartner.name
        };
      }
      return t;
    }));
  };

  const handleReleaseTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "À faire" as const,
          assignedTo: null
        };
      }
      return t;
    }));
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Standard points rewards
    const gainedPoints = task.points;

    // Update tasks status
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "Terminé" as const,
          assignedTo: t.assignedTo || currentPartner.name, // Auto assign to claimant if empty
          completedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    // Reward points to claimant
    setPartners(prev => prev.map(p => {
      // Determine who completed it. If not assigned, current partner gets the credit
      const completedBy = task.assignedTo || currentPartner.name;
      if (p.name.toLowerCase() === completedBy.toLowerCase()) {
        return {
          ...p,
          points: p.points + gainedPoints,
          totalPointsEarned: p.totalPointsEarned + gainedPoints
        };
      }
      return p;
    }));

    // Fire notification to alert the partner
    const completedBy = task.assignedTo || currentPartner.name;
    triggerNotification(`🎉 ${completedBy} a terminé la tâche : "${task.title}" (+${gainedPoints} pts)`, "complete");
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleTasksAddedFromAI = (newTasks: Task[]) => {
    if (!isPremium) {
      const todayCount = getTasksCreatedTodayCount();
      if (todayCount + newTasks.length > 5) {
        setPremiumModalOpen(true);
        return;
      }
    }
    setTasks(prev => [
      ...newTasks,
      ...prev
    ]);
    triggerNotification(`✨ IA EquiHome : ${newTasks.length} tâche(s) générée(s) pour le foyer !`, "success");
  };

  const handleNeedLogged = (text: string, count: number) => {
    // Only log needs if they actually fit inside the quota or premium is active
    if (!isPremium) {
      const todayCount = getTasksCreatedTodayCount();
      if (todayCount + count > 5) {
        // PostNeedForm handles this or gets blocked by handleTasksAddedFromAI first
        return;
      }
    }
    const newNeed: MentalLoadNeed = {
      id: `need-${Date.now()}`,
      text: text,
      author: currentPartner.name,
      createdAt: new Date().toISOString(),
      isProcessed: true,
      tasksGeneratedCount: count
    };
    setNeeds(prev => [newNeed, ...prev]);
    triggerNotification(`📢 ${currentPartner.name} a posté un nouveau besoin : "${text.slice(0, 40)}${text.length > 40 ? "..." : ""}"`, "need");
  };

  // --- MANUAL TASK ---
  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    if (!isPremium) {
      const todayCount = getTasksCreatedTodayCount();
      if (todayCount + 1 > 5) {
        setPremiumModalOpen(true);
        return;
      }
    }

    let assignedTo = null;
    if (manualSuggest === "Auteur") {
      assignedTo = currentPartner.name;
    } else if (manualSuggest === "Partenaire" && otherPartner) {
      assignedTo = otherPartner.name;
    }

    const newTask: Task = {
      id: `task-manual-${Date.now()}`,
      title: manualTitle.trim(),
      description: manualDesc.trim() || "Aucune description supplémentaire.",
      points: manualPoints,
      category: manualCategory,
      priority: manualPriority,
      status: "À faire",
      suggestedPartner: manualSuggest,
      assignedTo: assignedTo,
      createdBy: currentPartner.name,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    triggerNotification(`✍️ Nouvelle tâche créée par ${currentPartner.name} : "${manualTitle.trim()}"`, "info");
    
    // Clear & collapse
    setManualTitle("");
    setManualDesc("");
    setManualPoints(20);
    setManualCategory("Ménage");
    setManualPriority("Moyenne");
    setManualSuggest("Libre");
    setShowManualForm(false);
  };

  // --- REWARD STORE ---
  const handleClaimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.unlockedBy || currentPartner.points < reward.costPoints) return;

    // Deduct points
    setPartners(prev => prev.map(p => {
      if (p.id === currentPartner.id) {
        return {
          ...p,
          points: p.points - reward.costPoints
        };
      }
      return p;
    }));

    // Unlock reward
    setRewards(prev => prev.map(r => {
      if (r.id === rewardId) {
        return {
          ...r,
          unlockedBy: currentPartner.name,
          unlockedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  const handleAddReward = (title: string, description: string, costPoints: number, iconName: string) => {
    const newReward: Reward = {
      id: `reward-custom-${Date.now()}`,
      title: title,
      description: description,
      costPoints: costPoints,
      iconName: iconName,
      unlockedBy: null
    };

    setRewards(prev => [newReward, ...prev]);
  };

  // --- RESET FOR CONVENIENCE ---
  const handleResetData = () => {
    if (confirm("Voulez-vous réinitialiser l'application avec les données de démonstration ?")) {
      localStorage.removeItem("equihome_partners");
      localStorage.removeItem("equihome_tasks");
      localStorage.removeItem("equihome_rewards");
      localStorage.removeItem("equihome_needs");
      setPartners(INITIAL_PARTNERS);
      setTasks(DEFAULT_TASKS);
      setRewards(DEFAULT_REWARDS);
      setNeeds(DEFAULT_NEEDS);
      setCurrentPartnerId(INITIAL_PARTNERS[0].id);
      setActiveTab("planning");
    }
  };

  // --- FILTERED TASKS CALCULATIONS ---
  const filteredTasks = tasks.filter(t => {
    const matchesStatus = taskFilter === "Toutes" || t.status === taskFilter;
    const matchesCategory = categoryFilter === "Toutes" || t.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans flex flex-col md:flex-row overflow-hidden" id="app-root">
      
      {/* =========================================================
          1. LEFT SIDEBAR MENU (COLLAPSIBLE & MOBILE FRIENDLY)
         ========================================================= */}
      
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-natural-panel border-b border-natural-line px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 rounded-lg text-natural-text hover:bg-natural-bg transition"
          title="Ouvrir le menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-natural-terracotta fill-natural-terracotta/15" />
          <span className="font-serif font-bold text-lg text-natural-text tracking-tight">EquiHome</span>
        </div>

        {/* Quick Compact switch & tasks indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickTasksOpen(!quickTasksOpen)}
            className={`p-2 rounded-lg transition relative ${quickTasksOpen ? "bg-natural-sage/20 text-natural-olive" : "text-natural-accent hover:text-natural-text"}`}
            title="Aperçu des corvées"
          >
            <ClipboardList className="w-5 h-5" />
            {tasks.filter(t => t.status !== "Terminé").length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-natural-terracotta text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {tasks.filter(t => t.status !== "Terminé").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPartnerId(currentPartnerId === "p1" ? "p2" : "p1")}
            className="w-8 h-8 rounded-full border border-natural-line flex items-center justify-center text-sm bg-natural-panel shadow-sm hover:scale-105 transition-transform"
            title={`Passer à ${otherPartner?.name}`}
          >
            {currentPartner.avatarSeed}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-natural-text/40 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-natural-panel border-r border-natural-line flex flex-col z-40 transition-all duration-300 ${
          mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${sidebarExpanded ? "md:w-72" : "md:w-20"}`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-natural-line/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-natural-olive flex items-center justify-center text-white shrink-0 shadow-md shadow-natural-olive/10">
              <Heart className="w-5 h-5 fill-natural-sage/10" />
            </div>
            {sidebarExpanded && (
              <div className="text-left leading-tight">
                <span className="font-serif font-bold text-lg text-natural-text block tracking-tight">EquiHome</span>
                <span className="text-[10px] text-natural-accent font-semibold block">Harmonie du Foyer</span>
              </div>
            )}
          </div>

          {/* Close menu for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-natural-accent hover:bg-natural-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🕹️ QUICK SWITCH PERSPECTIVE (Simulation Couple) */}
        <div className="p-4 border-b border-natural-line/60 bg-natural-bg/30">
          {sidebarExpanded ? (
            <div className="space-y-2 text-left">
              <span className="text-[9px] uppercase font-bold tracking-wider text-natural-accent flex items-center gap-1">
                <Zap className="w-3 h-3 text-natural-olive fill-current" />
                Mode Simulation Couple
              </span>
              <div className="grid grid-cols-2 gap-1 bg-natural-panel p-1 rounded-xl border border-natural-line shadow-inner">
                {partners.map(p => {
                  const isActive = currentPartnerId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setCurrentPartnerId(p.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isActive 
                          ? "bg-natural-olive text-white shadow-sm" 
                          : "text-natural-accent hover:text-natural-text hover:bg-natural-bg"
                      }`}
                    >
                      <span className="text-sm">{p.avatarSeed}</span>
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[8px] uppercase font-bold text-natural-accent">Persp.</span>
              <div className="flex flex-col gap-1.5 bg-natural-panel p-1 rounded-xl border border-natural-line">
                {partners.map(p => {
                  const isActive = currentPartnerId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setCurrentPartnerId(p.id)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition relative ${
                        isActive ? "bg-natural-olive text-white shadow" : "text-natural-accent hover:bg-natural-bg"
                      }`}
                      title={`Passer à la perspective de ${p.name}`}
                    >
                      <span>{p.avatarSeed}</span>
                      {isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-natural-terracotta rounded-full border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "summary", label: "Tableau de Bord", icon: LayoutDashboard },
            { id: "planning", label: "Planning & IA", icon: ClipboardList, badgeCount: tasks.filter(t => t.status !== "Terminé").length },
            { id: "chat", label: "Discussion", icon: MessageSquare },
            { id: "dashboard", label: "Baromètre d'Équilibre", icon: Users },
            { id: "rewards", label: "Boutique Cadeaux", icon: Award },
            { id: "needs", label: "Fil des Besoins", icon: History }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileMenuOpen(false); // Close mobile drawer on navigation
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all relative ${
                  isActive
                    ? "bg-natural-olive/10 text-natural-olive font-serif text-base"
                    : "text-natural-accent hover:text-natural-text hover:bg-natural-bg/60"
                }`}
                title={tab.label}
              >
                <TabIcon className={`w-5 h-5 shrink-0 ${isActive ? "text-natural-olive" : "text-natural-accent/80"}`} />
                {sidebarExpanded && (
                  <span className="truncate text-left flex-1">{tab.label}</span>
                )}
                {sidebarExpanded && tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-natural-terracotta text-white text-[9px] font-bold">
                    {tab.badgeCount}
                  </span>
                )}
                {!sidebarExpanded && tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-natural-terracotta rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 🏆 SCORES & CAGNOTTES PANEL */}
        <div className="p-4 border-t border-natural-line/80 bg-natural-bg/10">
          {sidebarExpanded ? (
            <div className="bg-natural-panel border border-natural-line/80 rounded-2xl p-3.5 text-left space-y-3 shadow-inner">
              <span className="text-[9px] uppercase font-bold tracking-wider text-natural-accent block">Cagnottes Points 🌱</span>
              <div className="space-y-2.5">
                {partners.map(partner => {
                  const isCurrent = partner.id === currentPartner.id;
                  return (
                    <div key={partner.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base shrink-0">{partner.avatarSeed}</span>
                        <div className="leading-none">
                          <span className={`font-serif font-bold text-natural-text ${isCurrent ? "underline decoration-natural-olive decoration-2" : ""}`}>
                            {partner.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right font-semibold text-natural-terracotta">
                        {partner.points} pts
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Global Equilibrium Metric */}
              <div className="pt-2 border-t border-natural-line/40 flex items-center justify-between text-[10px] text-natural-accent font-bold">
                <span>Rapport d'équilibre</span>
                <span className="text-natural-olive">
                  {Math.abs(partners[0]?.points - partners[1]?.points) <= 15 ? "⚖️ Très équilibré" : "⚠️ Écart de points"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1 bg-natural-panel border border-natural-line/60 rounded-xl">
              <span className="text-[8px] uppercase font-bold text-natural-accent">Solde</span>
              {partners.map(partner => (
                <div key={partner.id} className="text-center relative group" title={`${partner.name} : ${partner.points} pts`}>
                  <span className="text-base">{partner.avatarSeed}</span>
                  <span className="block text-[9.5px] font-bold text-natural-terracotta font-mono mt-0.5">{partner.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR FOOTER & TOGGLE */}
        <div className="p-3 border-t border-natural-line/60 flex items-center justify-center bg-natural-panel">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-natural-accent hover:text-natural-text hover:bg-natural-bg transition"
            title={sidebarExpanded ? "Réduire le menu" : "Agrandir le menu"}
          >
            {sidebarExpanded ? (
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <ChevronLeft className="w-4 h-4 text-natural-accent" />
                <span>Masquer le menu</span>
              </div>
            ) : (
              <ChevronRight className="w-5 h-5 text-natural-accent" />
            )}
          </button>
        </div>
      </aside>

      {/* =========================================================
          2. MAIN WORKSPACE / CONTENT AREA (FLEX-1)
         ========================================================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-natural-bg">
        
        {/* Top Header/Toolbar inside Workspace */}
        <header className="bg-natural-panel border-b border-natural-line py-4 px-6 sticky top-0 z-10 shadow-xs hidden md:flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-natural-accent">
              EquiHome &bull; {activeTab === "summary" ? "Tableau de Bord" : activeTab === "planning" ? "Planning" : activeTab === "chat" ? "Discussion" : activeTab === "dashboard" ? "Indicateurs" : activeTab === "rewards" ? "Cadeaux" : "Besoins"}
            </span>
            <h1 className="font-serif font-bold text-xl text-natural-text mt-0.5">
              {activeTab === "summary" && "Aperçu de votre Foyer"}
              {activeTab === "planning" && "Assistant IA & Corvées"}
              {activeTab === "chat" && "Espace Discussion"}
              {activeTab === "dashboard" && "Baromètre d'Équilibre"}
              {activeTab === "rewards" && "Boutique Privée du Couple"}
              {activeTab === "needs" && "Chronologie des Besoins"}
            </h1>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick user status widget */}
            <div className="flex items-center gap-2 bg-natural-bg border border-natural-line rounded-xl px-3 py-1.5 text-xs text-left shadow-xs">
              <span className="text-lg">{currentPartner.avatarSeed}</span>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-natural-accent block leading-none">Actif</span>
                <span className="font-bold text-natural-text text-[11px]">{currentPartner.name}</span>
              </div>
            </div>

            {/* Premium Upgrade Button */}
            <button
              onClick={() => setPremiumModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                isPremium 
                  ? "bg-amber-500/15 border border-amber-500/30 text-amber-700 cursor-default" 
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              title={isPremium ? "Compte Premium Actif" : "S'abonner à EquiHome Premium"}
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>{isPremium ? "Premium Actif" : "Passer Premium"}</span>
            </button>

            {/* Quick Reset for demo utility */}
            <button
              onClick={handleResetData}
              className="px-2.5 py-1.5 rounded-xl border border-natural-line bg-natural-panel hover:bg-natural-bg transition text-xs font-bold text-natural-accent hover:text-natural-terracotta"
              title="Remettre à zéro les scores et données de test"
            >
              🔄 Réinitialiser
            </button>

            {/* Quick Tasks Side Drawer toggle */}
            <button
              id="btn-toggle-quick-tasks"
              onClick={() => setQuickTasksOpen(!quickTasksOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-xs ${
                quickTasksOpen 
                  ? "bg-natural-sage/20 border-natural-sage text-natural-olive" 
                  : "bg-natural-panel border-natural-line text-natural-text hover:bg-natural-bg"
              }`}
            >
              <ClipboardList className="w-4 h-4 text-natural-olive" />
              <span>Corvées Actives ({tasks.filter(t => t.status !== "Terminé").length})</span>
              {quickTasksOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Main Content Layout Grid */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Content Block: Tab Renderer */}
            <div className={`transition-all duration-300 ${quickTasksOpen ? "xl:col-span-9" : "xl:col-span-12"}`}>
              <AnimatePresence mode="wait">
                
                {/* TAB 0: TABLEAU DE BORD PRINCIPAL */}
                {activeTab === "summary" && (
                  <motion.div
                    key="summary-tab-pane"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MainDashboard 
                      tasks={tasks}
                      partners={partners}
                      rewards={rewards}
                      onNavigateToTab={(tabId) => setActiveTab(tabId)}
                    />
                  </motion.div>
                )}

                {/* TAB 1: PLANNING & IA SPLIT */}
                {activeTab === "planning" && (
                  <motion.div
                    key="planning-tab-pane"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Col: AI Needs Input Form */}
                      <div className="lg:col-span-5 space-y-6">
                        {/* Daily Quota Indicator */}
                        <div className={`p-4 rounded-3xl border text-xs text-left shadow-sm flex items-center justify-between ${
                          isPremium 
                            ? "bg-amber-500/5 border-amber-500/20 text-amber-800 font-medium" 
                            : getTasksCreatedTodayCount() >= 5 
                              ? "bg-red-500/10 border-red-500/20 text-red-800 font-bold" 
                              : "bg-natural-panel border-natural-line text-natural-text"
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-base shrink-0">{isPremium ? "👑" : "🌱"}</span>
                            <div>
                              <p className="font-serif font-bold text-[13px]">
                                {isPremium ? "Compte Premium Actif" : `Quota Journalier : ${getTasksCreatedTodayCount()} / 5 tâches`}
                              </p>
                              <p className="text-[10.5px] opacity-85 mt-0.5 leading-normal">
                                {isPremium ? "Tâches et expressions d'IA en illimité" : "La version gratuite est limitée à 5 tâches créées par jour."}
                              </p>
                            </div>
                          </div>
                          {!isPremium && (
                            <button
                              onClick={() => setPremiumModalOpen(true)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-serif font-bold rounded-xl text-[10.5px] shrink-0 transition shadow-sm"
                            >
                              S'abonner
                            </button>
                          )}
                        </div>

                        <PostNeedForm 
                          currentPartner={currentPartner}
                          partners={partners}
                          onTasksAdded={handleTasksAddedFromAI}
                          onNeedLogged={handleNeedLogged}
                        />

                        {/* Manual Add Card Toggle */}
                        <div className="bg-natural-panel border border-natural-line rounded-3xl p-5 shadow-sm text-left">
                          <button
                            id="btn-toggle-manual-form"
                            onClick={() => setShowManualForm(!showManualForm)}
                            className="w-full flex items-center justify-between text-sm font-bold text-natural-text hover:text-natural-olive transition"
                          >
                            <span className="flex items-center gap-2">
                              <PlusCircle className="w-4 h-4 text-natural-olive" />
                              Ajouter manuellement une tâche
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${showManualForm ? "rotate-90 text-natural-olive" : "text-natural-accent"}`} />
                          </button>

                          <AnimatePresence>
                            {showManualForm && (
                              <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleManualSubmit}
                                className="space-y-4 pt-4 mt-3 border-t border-natural-line overflow-hidden text-xs text-left"
                              >
                                <div>
                                  <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Intitulé de l'action</label>
                                  <input
                                    type="text"
                                    required
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                    placeholder="Ex: Ranger la salle de bain"
                                    className="w-full text-xs border border-natural-line rounded-xl px-3 py-2 outline-none bg-natural-panel text-natural-text focus:ring-1 focus:ring-natural-olive"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Description (Facultatif)</label>
                                  <input
                                    type="text"
                                    value={manualDesc}
                                    onChange={(e) => setManualDesc(e.target.value)}
                                    placeholder="Ex: Remettre les serviettes à sécher et ranger le maquillage"
                                    className="w-full text-xs border border-natural-line rounded-xl px-3 py-2 outline-none bg-natural-panel text-natural-text focus:ring-1 focus:ring-natural-olive"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Thème / Catégorie</label>
                                    <select
                                      value={manualCategory}
                                      onChange={(e) => setManualCategory(e.target.value as TaskCategory)}
                                      className="w-full text-xs border border-natural-line rounded-xl px-2 py-2 bg-natural-panel text-natural-text focus:ring-1 focus:ring-natural-olive outline-none"
                                    >
                                      {["Ménage", "Cuisine", "Enfants", "Administratif", "Courses", "Animaux", "Autre"].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Valeur Points 🌱</label>
                                    <input
                                      type="number"
                                      min={10}
                                      max={100}
                                      value={manualPoints}
                                      onChange={(e) => setManualPoints(parseInt(e.target.value) || 10)}
                                      className="w-full text-xs border border-natural-line rounded-xl px-2 py-2 font-bold text-natural-terracotta text-center bg-natural-panel"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Priorité</label>
                                    <select
                                      value={manualPriority}
                                      onChange={(e) => setManualPriority(e.target.value as TaskPriority)}
                                      className="w-full text-xs border border-natural-line rounded-xl px-2 py-2 bg-natural-panel text-natural-text focus:ring-1 focus:ring-natural-olive outline-none"
                                    >
                                      <option value="Basse">Basse</option>
                                      <option value="Moyenne">Moyenne</option>
                                      <option value="Élevée">Élevée</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-natural-accent uppercase tracking-wider mb-1">Assigner à</label>
                                    <select
                                      value={manualSuggest}
                                      onChange={(e) => setManualSuggest(e.target.value as any)}
                                      className="w-full text-xs border border-natural-line rounded-xl px-2 py-2 bg-natural-panel text-natural-text focus:ring-1 focus:ring-natural-olive outline-none"
                                    >
                                      <option value="Libre">Libre (Quiconque)</option>
                                      <option value="Auteur">Moi ({currentPartner.name})</option>
                                      <option value="Partenaire">Mon Partenaire</option>
                                    </select>
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  id="btn-submit-manual-task"
                                  className="w-full py-2.5 bg-natural-terracotta text-white font-bold rounded-xl hover:bg-natural-terracotta/90 transition shadow-sm"
                                >
                                  Enregistrer la tâche
                                </button>
                              </motion.form>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Right Col: Shared domestic tasks list */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-natural-panel border border-natural-line p-4 rounded-3xl shadow-sm text-left">
                          <h3 className="font-serif font-bold text-natural-text text-xl">Planning des corvées</h3>
                          
                          {/* Filter controllers */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Filter Status */}
                            <select
                              id="filter-status-select"
                              value={taskFilter}
                              onChange={(e) => setTaskFilter(e.target.value as any)}
                              className="text-xs border border-natural-line rounded-lg px-2.5 py-1.5 bg-natural-panel text-natural-text outline-none focus:ring-1 focus:ring-natural-olive"
                            >
                              <option value="Toutes">Tous les statuts</option>
                              <option value="À faire">À faire</option>
                              <option value="En cours">En cours</option>
                              <option value="Terminé">Terminées</option>
                            </select>

                            {/* Filter Category */}
                            <select
                              id="filter-category-select"
                              value={categoryFilter}
                              onChange={(e) => setCategoryFilter(e.target.value)}
                              className="text-xs border border-natural-line rounded-lg px-2.5 py-1.5 bg-natural-panel text-natural-text outline-none focus:ring-1 focus:ring-natural-olive"
                            >
                              <option value="Toutes">Toutes catégories</option>
                              {["Ménage", "Cuisine", "Enfants", "Administratif", "Courses", "Animaux", "Autre"].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Tasks Grid */}
                        <div className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {filteredTasks.map(task => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                currentPartner={currentPartner}
                                partners={partners}
                                onClaim={handleClaimTask}
                                onComplete={handleCompleteTask}
                                onRelease={handleReleaseTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </AnimatePresence>

                          {filteredTasks.length === 0 && (
                            <div className="bg-natural-panel border border-natural-line rounded-3xl p-10 text-center text-natural-accent">
                              <CheckCircle className="w-12 h-12 text-natural-line mx-auto mb-3 stroke-1" />
                              <h4 className="font-serif font-bold text-natural-text text-xl">Aucune tâche trouvée</h4>
                              <p className="text-xs text-natural-accent mt-1">Modifiez vos filtres ou exprimez un nouveau besoin avec l'IA pour générer des actions.</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 2: VISUAL BAROMETER & BALANCE STATS */}
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard-tab-pane"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <CoupleSyncCard 
                      isSynced={isSynced}
                      inviteCode={inviteCode}
                      onSync={handleSync}
                      onDisconnect={handleDisconnect}
                      partnerName={syncedPartnerName}
                    />

                    <DashboardStats 
                      tasks={tasks}
                      partners={partners}
                    />
                  </motion.div>
                )}

                {/* TAB 3: REWARD STORE */}
                {activeTab === "rewards" && (
                  <motion.div
                    key="rewards-tab-pane"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <RewardStore 
                      rewards={rewards}
                      currentPartner={currentPartner}
                      onClaimReward={handleClaimReward}
                      onAddReward={handleAddReward}
                    />
                  </motion.div>
                )}

                {/* TAB 4: REAL-TIME NEEDS LOG */}
                {activeTab === "needs" && (
                  <motion.div
                    key="needs-tab-pane"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm text-left">
                      <h3 className="font-serif font-bold text-natural-text text-xl">Historique des Surcharges & Besoins</h3>
                      <p className="text-xs text-natural-accent mt-0.5">Retrouvez la chronologie des expressions de fatigue de chacun et comment le partenaire y a répondu.</p>
                      
                      <div className="mt-6 space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-natural-line">
                        {needs.map((need) => {
                          const authorObj = partners.find(p => p.name === need.author);
                          return (
                            <div key={need.id} id={`need-log-${need.id}`} className="flex gap-4 relative">
                              {/* Avatar bubble */}
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 z-10 border ${
                                authorObj?.avatarColor || "bg-natural-bg border-natural-line"
                              }`}>
                                {authorObj?.avatarSeed || "👤"}
                              </div>
                              
                              <div className="bg-natural-bg/50 border border-natural-line rounded-2xl p-4 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <span className="font-serif font-bold text-natural-text text-sm">
                                    {need.author} a partagé un besoin
                                  </span>
                                  <span className="text-[10px] font-mono text-natural-accent">
                                    {new Date(need.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                                  </span>
                                </div>
                                <p className="text-sm text-natural-text italic mt-2 bg-natural-panel rounded-xl p-3 border border-natural-line/30 leading-relaxed font-serif">
                                  "{need.text}"
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold bg-natural-sage/20 text-natural-olive px-2 py-0.5 rounded-md border border-natural-sage/30">
                                    🪄 {need.tasksGeneratedCount} tâche{need.tasksGeneratedCount > 1 ? "s" : ""} créée{need.tasksGeneratedCount > 1 ? "s" : ""}
                                  </span>
                                  <span className="text-[10px] text-natural-olive font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-natural-sage" /> Prise en charge planifiée
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {needs.length === 0 && (
                          <div className="text-center py-10 text-natural-accent">
                            Aucun besoin partagé pour le moment. Allez sur l'onglet "Planning & IA" pour vous exprimer.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 5: DISCUSSION / CHAT */}
                {activeTab === "chat" && (
                  <motion.div
                    key="chat-tab-pane"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CoupleChat 
                      messages={messages}
                      partners={partners}
                      currentPartner={currentPartner}
                      onSendMessage={handleSendMessage}
                      onClearHistory={handleClearHistory}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* =========================================================
                3. RIGHT SIDE PANEL: FLOATING / INTEGRATED ACTIVE TACHES
               ========================================================= */}
            <AnimatePresence>
              {quickTasksOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="col-span-1 xl:col-span-3 text-left bg-natural-panel border border-natural-line rounded-3xl p-5 shadow-sm sticky top-24 self-start"
                  id="quick-tasks-side-panel"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-natural-line mb-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-natural-olive" />
                      <h3 className="font-serif font-bold text-natural-text text-base">Aperçu Corvées</h3>
                    </div>
                    <button
                      onClick={() => setQuickTasksOpen(false)}
                      className="p-1 rounded-md hover:bg-natural-bg text-natural-accent hover:text-natural-text transition"
                      title="Masquer l'aperçu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info helper text */}
                  <p className="text-[10.5px] text-natural-accent leading-normal mb-4">
                    Prrenez en charge ou validez directement vos actions ci-dessous depuis n'importe quelle page.
                  </p>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {tasks.filter(t => t.status !== "Terminé").length > 0 ? (
                      tasks
                        .filter(t => t.status !== "Terminé")
                        .map(task => {
                          const isAssignedToMe = task.assignedTo === currentPartner.name;
                          const isAssignedToPartner = task.assignedTo && task.assignedTo !== currentPartner.name;
                          
                          return (
                            <div 
                              key={task.id} 
                              className={`p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-2.5 ${
                                isAssignedToMe 
                                  ? "bg-natural-sage/10 border-natural-sage/50" 
                                  : isAssignedToPartner 
                                    ? "bg-natural-bg/40 border-natural-line/40 opacity-75"
                                    : "bg-natural-bg/80 border-natural-line hover:border-natural-accent/30"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] font-bold bg-natural-panel border border-natural-line px-1.5 py-0.5 rounded-md text-natural-accent">
                                    {task.category}
                                  </span>
                                  <span className="font-extrabold text-natural-terracotta">
                                    🌱 {task.points} pts
                                  </span>
                                </div>
                                <h4 className="font-serif font-bold text-natural-text text-xs mt-1.5 leading-tight">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-[10px] text-natural-accent mt-0.5 line-clamp-1">{task.description}</p>
                                )}
                              </div>

                              <div className="pt-2 border-t border-natural-line/30 flex items-center justify-between gap-2">
                                {/* Assignment / Action status */}
                                <div className="text-[10px]">
                                  {task.assignedTo ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs">
                                        {partners.find(p => p.name === task.assignedTo)?.avatarSeed || "👤"}
                                      </span>
                                      <span className="font-bold text-natural-text truncate max-w-[70px]">
                                        {isAssignedToMe ? "Moi" : task.assignedTo}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-natural-terracotta font-medium italic">Non assignée</span>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Claim Action */}
                                  {!task.assignedTo && (
                                    <button
                                      onClick={() => handleClaimTask(task.id)}
                                      className="px-2 py-1 rounded-lg bg-natural-olive text-white text-[10px] font-bold hover:bg-natural-olive/90 transition"
                                      title="Prendre en charge cette tâche"
                                    >
                                      Prendre
                                    </button>
                                  )}

                                  {/* Me claims Actions */}
                                  {isAssignedToMe && (
                                    <>
                                      <button
                                        onClick={() => handleCompleteTask(task.id)}
                                        className="px-2.5 py-1 rounded-lg bg-natural-terracotta text-white text-[10px] font-bold hover:bg-natural-terracotta/90 transition flex items-center gap-0.5"
                                        title="Marquer comme terminée"
                                      >
                                        <Check className="w-3 h-3" /> Fait
                                      </button>
                                      <button
                                        onClick={() => handleReleaseTask(task.id)}
                                        className="p-1 rounded-lg hover:bg-natural-bg border border-natural-line text-natural-accent hover:text-natural-text text-[10px]"
                                        title="Libérer la tâche"
                                      >
                                        Détacher
                                      </button>
                                    </>
                                  )}

                                  {/* Other Partner claims Info */}
                                  {isAssignedToPartner && (
                                    <span className="text-[9px] text-natural-accent font-semibold italic">En cours...</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8 px-4 border border-dashed border-natural-line rounded-2xl bg-natural-bg/10">
                        <CheckCircle className="w-8 h-8 text-natural-olive/35 mx-auto mb-2" />
                        <p className="text-xs font-bold text-natural-text">Foyer impeccable !</p>
                        <p className="text-[10px] text-natural-accent mt-1 leading-normal">
                          Aucune corvée n'est en attente pour le moment. Prenez du temps pour vous.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

        {/* FOOTER COOPERATIVE MESSAGE */}
        <footer className="bg-natural-panel border-t border-natural-line mt-auto py-6 text-center text-xs text-natural-accent">
          <div className="max-w-6xl mx-auto px-6 space-y-2">
            <p className="flex items-center justify-center gap-1.5 font-bold text-natural-text">
              Fait avec <Heart className="w-4 h-4 text-natural-terracotta fill-natural-terracotta/20" /> pour l'équilibre des foyers.
            </p>
            <p className="max-w-lg mx-auto text-[10px] text-natural-accent leading-normal">
              EquiHome favorise la communication non violente et la transparence domestique. Discutez toujours avec bienveillance de vos charges de travail !
            </p>
          </div>
        </footer>

      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none" id="floating-notifications">
        <AnimatePresence>
          {notifications.map((notif) => {
            let bgColor = "bg-natural-panel border-natural-line";
            let icon = "🔔";
            if (notif.type === "complete") {
              bgColor = "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-sm shadow-emerald-500/5";
              icon = "🎉";
            } else if (notif.type === "need") {
              bgColor = "bg-amber-50 text-amber-900 border-amber-200 shadow-sm shadow-amber-500/5";
              icon = "📢";
            } else if (notif.type === "success") {
              bgColor = "bg-blue-50 text-blue-900 border-blue-200 shadow-sm shadow-blue-500/5";
              icon = "✨";
            } else if (notif.type === "info") {
              bgColor = "bg-natural-panel text-natural-text border-natural-line shadow-sm";
              icon = "💬";
            }

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`p-3.5 rounded-2xl border text-xs text-left shadow-lg flex items-start gap-3 pointer-events-auto ${bgColor}`}
                id={`toast-${notif.id}`}
              >
                <span className="text-base shrink-0">{icon}</span>
                <div className="flex-1">
                  <p className="font-semibold leading-relaxed">{notif.message}</p>
                  <p className="text-[9.5px] opacity-75 mt-0.5">À l'instant</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  className="text-natural-accent hover:text-natural-text text-sm transition-colors cursor-pointer shrink-0 ml-1.5 self-center"
                  title="Fermer"
                >
                  &times;
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <PremiumModal 
        isOpen={premiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)} 
        onUpgradeSuccess={() => setIsPremium(true)} 
      />

    </div>
  );
}
