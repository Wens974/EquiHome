import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  X, 
  Crown, 
  ShieldCheck, 
  TrendingUp, 
  Gift, 
  Infinity as InfinityIcon,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export default function PremiumModal({ isOpen, onClose, onUpgradeSuccess }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onUpgradeSuccess();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="premium-modal-overlay">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-natural-text/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-natural-panel border border-natural-line rounded-3xl shadow-xl w-full max-w-lg p-6 overflow-hidden z-10 text-left"
          id="premium-modal-content"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-natural-accent hover:text-natural-text hover:bg-natural-bg transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {!success ? (
            <div className="space-y-6">
              {/* Premium Header badge */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 fill-amber-500/10" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-600">Offre exclusive</span>
                  <h3 className="font-serif font-bold text-2xl text-natural-text">EquiHome Premium</h3>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm text-natural-text/80 leading-relaxed">
                Dites adieu à la charge mentale déséquilibrée ! Déverrouillez la puissance illimitée de l'IA pour votre foyer.
              </p>

              {/* Limits Warning reminder */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-2.5">
                <span className="text-lg">⚠️</span>
                <span className="text-xs text-amber-800 font-medium">
                  <strong>Quota atteint :</strong> La version gratuite est limitée à <strong>5 tâches par jour</strong>. Passez premium pour planifier sans aucune limite.
                </span>
              </div>

              {/* Premium Perks Grid */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-natural-accent">Ce qui est inclus dans l'offre :</h4>
                
                <div className="space-y-3">
                  {/* Perk 1 */}
                  <div className="flex items-start gap-3 text-xs text-natural-text">
                    <div className="p-1 rounded bg-natural-sage/20 text-natural-olive mt-0.5 shrink-0">
                      <InfinityIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-natural-text font-bold block">Tâches & besoins illimités</strong>
                      <span className="text-natural-accent">Planifiez autant d'actions de couple que nécessaire, tous les jours de l'année.</span>
                    </div>
                  </div>

                  {/* Perk 2 */}
                  <div className="flex items-start gap-3 text-xs text-natural-text">
                    <div className="p-1 rounded bg-natural-sage/20 text-natural-olive mt-0.5 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-natural-text font-bold block">IA Assistante Évoluée</strong>
                      <span className="text-natural-accent">Analyses plus profondes de la charge mentale, résumés de semaine & recommandations bienveillantes personnalisées.</span>
                    </div>
                  </div>

                  {/* Perk 3 */}
                  <div className="flex items-start gap-3 text-xs text-natural-text">
                    <div className="p-1 rounded bg-natural-sage/20 text-natural-olive mt-0.5 shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-natural-text font-bold block">Statistiques à long terme & Bilans</strong>
                      <span className="text-natural-accent">Accédez à l'historique complet, aux tendances de répartition mensuelles et à des conseils sur-mesure.</span>
                    </div>
                  </div>

                  {/* Perk 4 */}
                  <div className="flex items-start gap-3 text-xs text-natural-text">
                    <div className="p-1 rounded bg-natural-sage/20 text-natural-olive mt-0.5 shrink-0">
                      <Gift className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-natural-text font-bold block">Boutique Cadeaux Infinie</strong>
                      <span className="text-natural-accent">Créez et déverrouillez des bons de récompenses totalement personnalisés pour pimenter votre complicité.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Pricing Badge */}
              <div className="bg-natural-bg border border-natural-line rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-natural-accent">Abonnement sans engagement</span>
                  <p className="font-serif font-bold text-lg text-natural-text">Harmonie Absolue</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-natural-accent line-through block">4,99 €/mois</span>
                  <span className="font-serif font-bold text-xl text-natural-olive">Simulé Gratuit 🎁</span>
                </div>
              </div>

              {/* Trigger Upgrade Button */}
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-serif font-bold rounded-2xl transition shadow flex items-center justify-center gap-2 relative overflow-hidden"
                id="btn-upgrade-premium"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Activation en cours...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 fill-white/10" />
                    Activer EquiHome Premium gratuitement (Démo)
                  </>
                )}
              </button>

              <p className="text-[10.5px] text-center text-natural-accent leading-normal">
                Aucune vraie carte bancaire n'est requise. Il s'agit d'une simulation d'intégration de service de paiement premium pour tester les fonctionnalités.
              </p>
            </div>
          ) : (
            /* Success Feedback Animation */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-extrabold text-amber-600 tracking-widest">Compte Activé</span>
                <h3 className="font-serif font-bold text-2xl text-natural-text">Bienvenue chez Premium !</h3>
                <p className="text-xs text-natural-accent max-w-sm mx-auto leading-relaxed">
                  Votre abonnement EquiHome Premium a bien été activé. Vous avez désormais un accès illimité aux tâches, au baromètre étendu, et à toutes les fonctionnalités !
                </p>
              </div>

              {/* Visual card badge simulated */}
              <div className="bg-gradient-to-tr from-amber-500 to-yellow-600 text-white rounded-3xl p-5 shadow-lg max-w-xs mx-auto text-left relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-15">
                  <Crown className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="w-5 h-5 fill-white/20" />
                  <span className="font-serif font-bold tracking-wider text-sm">EQUIHOME PREMIUM</span>
                </div>
                <div className="space-y-1.5 leading-none">
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-80 block">Membres du Foyer</span>
                  <span className="font-semibold text-xs block">Synchronisation active &bull; Illimité</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-natural-text text-natural-bg font-serif font-bold rounded-xl hover:opacity-95 transition text-xs shadow"
              >
                Super ! Retourner au foyer
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
