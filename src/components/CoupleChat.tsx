import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Partner } from "../types";
import { 
  Send, 
  Heart, 
  Smile, 
  Sparkles, 
  Clock, 
  Trash2, 
  MessageSquare, 
  AlertCircle,
  HelpCircle,
  CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CoupleChatProps {
  messages: ChatMessage[];
  partners: Partner[];
  currentPartner: Partner;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
}

const QUICK_NOTES = [
  "Merci pour ton aide ! 💖",
  "Je m'en charge ! 🧼",
  "Grosse journée, fatigué(e) ce soir... 😴",
  "Tu es génial(e) ! 🏆",
  "On mange quoi ce soir ? 🍕",
  "Tâche terminée avec succès ! 🚀"
];

export default function CoupleChat({ 
  messages, 
  partners, 
  currentPartner, 
  onSendMessage, 
  onClearHistory 
}: CoupleChatProps) {
  const [inputText, setInputText] = useState("");
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [typingSimulated, setTypingSimulated] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const partnerName = partners.find(p => p.id !== currentPartner.id)?.name || "Partenaire";

  // Auto-scroll to bottom of discussion
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    onSendMessage(inputText.trim());
    setInputText("");

    // Simulate partner reaction after 2.5 seconds to make the chat lively
    setTypingSimulated(true);
    setTimeout(() => {
      setTypingSimulated(false);
    }, 2000);
  };

  const handleQuickNoteClick = (note: string) => {
    onSendMessage(note);
    setShowQuickNotes(false);
  };

  // Helper to format timestamps gracefully
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-natural-panel border border-natural-line rounded-3xl p-6 shadow-sm flex flex-col h-[620px]" id="couple-chat">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-natural-line mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-natural-sage/20 text-natural-olive flex items-center justify-center font-bold text-lg">
            💬
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold text-natural-text text-lg">Espace de Discussion</h3>
            <p className="text-xs text-natural-text/70 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-natural-olive inline-block animate-pulse" />
              Canal de discussion privé avec {partnerName}
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="p-2 text-natural-accent hover:text-natural-terracotta hover:bg-natural-bg rounded-xl transition-all"
          title="Effacer l'historique"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-left scrollbar-thin scrollbar-thumb-natural-line" id="chat-messages-container">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-natural-accent space-y-3">
            <MessageSquare className="w-12 h-12 stroke-[1.5] text-natural-line" />
            <div>
              <p className="font-serif font-bold text-sm">Aucun message pour l'instant</p>
              <p className="text-xs max-w-xs mt-1">Dites quelque chose de gentil pour égayer la journée de votre partenaire !</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentPartner.id;
            const senderPartner = partners.find(p => p.id === msg.senderId);
            
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border shrink-0 ${
                  senderPartner?.avatarColor || "bg-natural-bg border-natural-line"
                }`}>
                  {senderPartner?.avatarSeed || "👥"}
                </div>

                {/* Message block */}
                <div className="space-y-1">
                  <div className={`text-[10px] font-bold text-natural-accent ${isMe ? "text-right" : "text-left"}`}>
                    {msg.senderName}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs relative ${
                    isMe 
                      ? "bg-natural-olive text-white rounded-tr-none" 
                      : "bg-natural-bg border border-natural-line text-natural-text rounded-tl-none"
                  }`}>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    
                    <span className={`text-[9px] mt-1.5 flex items-center gap-1 justify-end opacity-75 ${
                      isMe ? "text-white/80" : "text-natural-accent"
                    }`}>
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(msg.createdAt)}
                      {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* simulated partner is typing */}
        {typingSimulated && (
          <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-natural-bg border border-natural-line flex items-center justify-center text-sm">
              💬
            </div>
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-natural-accent">{partnerName}</span>
              <div className="bg-natural-bg border border-natural-line rounded-2xl rounded-tl-none px-4 py-2 text-xs text-natural-accent flex items-center gap-1.5">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-natural-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-natural-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-natural-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>En train d'écrire...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Control space */}
      <div className="pt-3 border-t border-natural-line mt-3 space-y-2">
        {/* Quick notes selector */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowQuickNotes(!showQuickNotes)}
              className="text-xs text-natural-olive hover:text-natural-olive/80 font-serif font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showQuickNotes ? "Masquer les notes rapides" : "Notes d'amour & de service rapides"}</span>
            </button>
            <span className="text-[10px] text-natural-accent">Active : <strong>{currentPartner.name}</strong></span>
          </div>

          <AnimatePresence>
            {showQuickNotes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-natural-panel border border-natural-line rounded-2xl p-3 shadow-lg z-10 grid grid-cols-2 gap-2"
              >
                {QUICK_NOTES.map((note) => (
                  <button
                    key={note}
                    onClick={() => handleQuickNoteClick(note)}
                    className="p-2 bg-natural-bg hover:bg-natural-sage/20 border border-natural-line rounded-xl text-left text-[11px] text-natural-text hover:text-natural-olive hover:border-natural-sage/50 transition-all font-medium truncate"
                  >
                    {note}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Écrire un message doux à ${partnerName}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-natural-line bg-natural-bg text-natural-text placeholder-natural-accent/70 text-xs focus:ring-1 focus:ring-natural-olive outline-none"
            id="chat-input-text"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-2xl text-white transition flex items-center justify-center shrink-0 ${
              inputText.trim() 
                ? "bg-natural-olive hover:bg-natural-olive/90 cursor-pointer" 
                : "bg-natural-line text-natural-accent/50 cursor-not-allowed"
            }`}
            title="Envoyer le message"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

        {/* Informative advice */}
        <div className="bg-natural-bg/50 rounded-xl p-2.5 border border-natural-line/80 flex items-start gap-2 text-[10px] text-natural-accent leading-normal">
          <AlertCircle className="w-3.5 h-3.5 text-natural-olive shrink-0 mt-0.5" />
          <p>
            Astuce : Changez de profil de partenaire dans la barre latérale pour simuler l'échange de messages sur le même écran !
          </p>
        </div>
      </div>
    </div>
  );
}
