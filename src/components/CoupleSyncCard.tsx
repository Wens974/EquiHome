import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Copy, 
  Check, 
  Link2, 
  Users, 
  Sparkles, 
  QrCode, 
  Send,
  AlertCircle,
  Unlink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CoupleSyncCardProps {
  isSynced: boolean;
  inviteCode: string;
  onSync: (code: string) => Promise<boolean>;
  onDisconnect: () => void;
  partnerName: string;
}

export default function CoupleSyncCard({ isSynced, inviteCode, onSync, onDisconnect, partnerName }: CoupleSyncCardProps) {
  const [partnerInputCode, setPartnerInputCode] = useState("");
  const [copyCodeStatus, setCopyCodeStatus] = useState(false);
  const [copyLinkStatus, setCopyLinkStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSteps, setSyncSteps] = useState<string>("");

  // Create an invitation URL using current window location
  const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopyCodeStatus(true);
      setTimeout(() => setCopyCodeStatus(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyLinkStatus(true);
      setTimeout(() => setCopyLinkStatus(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerInputCode.trim()) return;
    
    setError(null);
    setLoading(true);

    const code = partnerInputCode.trim().toUpperCase();

    if (code === inviteCode.toUpperCase()) {
      setError("Vous ne pouvez pas entrer votre propre code de foyer.");
      setLoading(false);
      return;
    }

    // Step-by-step connection messages for high polish
    const steps = [
      "Recherche du foyer partenaire...",
      "Vérification du code d'invitation...",
      "Initialisation de la passerelle sécurisée de couple...",
      "Synchronisation des cagnottes et de la charge mentale...",
      "Foyers synchronisés !"
    ];

    for (let i = 0; i < steps.length; i++) {
      setSyncSteps(steps[i]);
      await new Promise(resolve => setTimeout(resolve, i === 4 ? 400 : 700));
    }

    const success = await onSync(code);
    setLoading(false);
    if (success) {
      setPartnerInputCode("");
    } else {
      setError("Le code de foyer saisi est invalide. Veuillez vérifier le format (ex: EQUI-XXXX-LOVE).");
    }
  };

  return (
    <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm text-left" id="couple-sync-card">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-natural-sage/20 text-natural-olive">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-natural-text text-xl">Synchronisation de Couple</h3>
            <p className="text-xs text-natural-text/70 mt-0.5">Partagez votre charge mentale et vos tâches en direct</p>
          </div>
        </div>
        
        {isSynced ? (
          <span className="px-2.5 py-1 rounded-full bg-natural-sage/20 border border-natural-sage/30 text-natural-olive text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-natural-olive" />
            Connecté
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-natural-accent/15 border border-natural-accent/30 text-natural-accent text-[11px] font-bold">
            Mode Solo / Simulation
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isSynced ? (
          /* Active Connection view */
          <motion.div
            key="synced-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-natural-sage/10 border border-natural-sage/20 rounded-2xl flex items-start gap-3">
              <span className="text-xl mt-0.5">❤️</span>
              <div className="text-xs text-natural-text leading-relaxed">
                <p className="font-bold text-natural-olive text-sm">Foyers synchronisés avec succès !</p>
                <p className="mt-1 text-natural-accent">
                  Vous partagez désormais en temps réel le même planning de corvées, les scores de charge mentale, le baromètre d'équilibre, et la boutique de cadeaux avec <strong>{partnerName}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-natural-bg/50 border border-natural-line/60 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-natural-accent block leading-none">Code de synchronisation actif</span>
                <span className="font-mono font-bold text-natural-text mt-1.5 block text-sm">{inviteCode}</span>
              </div>

              <button
                onClick={onDisconnect}
                className="px-3.5 py-2 rounded-xl border border-natural-line hover:border-natural-terracotta/40 hover:bg-natural-terracotta/5 text-natural-accent hover:text-natural-terracotta transition text-xs font-bold flex items-center gap-1.5"
                title="Déconnecter le foyer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Déconnecter</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Disconnected configuration / Invite generation view */
          <motion.div
            key="config-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <p className="text-xs text-natural-text/80 leading-relaxed">
              Pour connecter vos deux téléphones ou navigateurs et gérer le foyer ensemble, l'un de vous doit envoyer son code ou son lien d'invitation, et l'autre doit le saisir ci-dessous.
            </p>

            {/* Part A: Generate my Invite details */}
            <div className="bg-natural-bg/50 border border-natural-line rounded-2xl p-4 space-y-3.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-natural-accent block">Étape 1 : Partager mon accès</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Code badge */}
                <div className="bg-natural-panel border border-natural-line/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-natural-accent block font-medium uppercase">Votre code unique</span>
                    <span className="font-mono font-bold text-natural-text text-sm mt-1 inline-block">{inviteCode}</span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg border border-natural-line hover:bg-natural-bg text-natural-accent hover:text-natural-olive transition"
                    title="Copier le code"
                  >
                    {copyCodeStatus ? <Check className="w-3.5 h-3.5 text-natural-olive" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Link badge */}
                <div className="bg-natural-panel border border-natural-line/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-left leading-none truncate pr-2">
                    <span className="text-[9px] text-natural-accent block font-medium uppercase">Lien d'invitation direct</span>
                    <span className="text-[11px] font-bold text-natural-text mt-1.5 inline-block truncate max-w-[120px]">{inviteUrl}</span>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg border border-natural-line hover:bg-natural-bg text-natural-accent hover:text-natural-olive transition shrink-0"
                    title="Copier le lien d'invitation direct"
                  >
                    {copyLinkStatus ? <Check className="w-3.5 h-3.5 text-natural-olive" /> : <Link2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Part B: Submit partner's code */}
            <form onSubmit={handleSyncSubmit} className="space-y-3.5 pt-1">
              <label className="block text-[10px] uppercase font-extrabold tracking-wider text-natural-accent leading-none">
                Étape 2 : Saisir le code reçu de mon partenaire
              </label>

              {error && (
                <div className="p-3 bg-natural-terracotta/10 text-natural-terracotta rounded-xl text-xs flex items-center gap-2 border border-natural-terracotta/20">
                  <AlertCircle className="w-4.5 h-4.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={partnerInputCode}
                  onChange={(e) => setPartnerInputCode(e.target.value)}
                  placeholder="Ex: EQUI-8492-LOVE"
                  className="flex-1 text-sm border border-natural-line rounded-xl px-3.5 py-2.5 outline-none bg-natural-bg text-natural-text font-mono font-bold uppercase focus:ring-1 focus:ring-natural-olive text-center sm:text-left"
                />

                <button
                  type="submit"
                  disabled={loading || !partnerInputCode.trim()}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 ${
                    loading || !partnerInputCode.trim()
                      ? "bg-natural-line text-natural-accent/50 cursor-not-allowed"
                      : "bg-natural-olive hover:bg-natural-olive/90"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Connecter le couple</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-natural-sage/10 border border-natural-sage/20 p-3.5 rounded-xl text-center space-y-2 mt-2"
              >
                <p className="text-xs font-bold text-natural-olive flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-natural-olive" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{syncSteps}</span>
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
