"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/config/client";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Globe, Send } from "lucide-react";
import { cn } from "@/lib/utils";

// Types and Interfaces
interface Message {
  role: "user" | "assistant";
  message: string;
  id?: string;
  timestamp?: Date;
}

interface TranslationCache {
  [messageIndex: number]: {
    [language: string]: string | undefined;
    activeLang?: string;
  };
}

interface ChatResponse {
  reply?: string;
  parsed?: {
    suggestions?: string[];
  };
}

interface ChatWidgetProps {
  userId?: number | null;
  className?: string;
}

interface LanguageOption {
  code: string;
  label: string;
}

// Constants
const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "ceb", label: "Bisaya" },
  { code: "tl", label: "Tagalog" },
];

const TYPING_MESSAGE = "💬 Assistant is typing...";
const GUEST_ID_KEY = "bk_guest_id";

export default function ChatWidget({ userId = null, className }: ChatWidgetProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<TranslationCache>({});
  const [originalTexts, setOriginalTexts] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);

  // Refs
  const endRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize guest ID and load chat history
  useEffect(() => {
    let guestIdValue = localStorage.getItem(GUEST_ID_KEY);
    if (!guestIdValue) {
      guestIdValue = uuidv4();
      localStorage.setItem(GUEST_ID_KEY, guestIdValue);
    }
    setGuestId(guestIdValue);

    if (isOpen) {
      loadHistory(guestIdValue, userId);
    }
  }, [isOpen, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLangMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load chat history
  const loadHistory = useCallback(async (guestIdValue: string, userIdValue: number | null) => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("chatbot_messages")
        .select("role, message, created_at")
        .or(userIdValue ? `user_id.eq.${userIdValue}` : `guest_id.eq.${guestIdValue}`)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("Error loading chat history:", fetchError);
        setError("Failed to load chat history");
        return;
      }

      if (data && data.length > 0) {
        const formattedMessages: Message[] = data.map((d, index) => ({
          role: d.role as "user" | "assistant",
          message: d.message,
          id: `${d.role}-${index}`,
          timestamp: new Date(d.created_at),
        }));
        setMessages(formattedMessages);
      } else {
        // Show animated greeting for new users
        setMessages([{ role: "assistant", message: TYPING_MESSAGE, id: "typing-initial" }]);

        setTimeout(() => {
          setMessages([
            {
              role: "assistant",
              message: "👋 Hello! How may I assist you today?",
              id: "greeting",
              timestamp: new Date(),
            },
          ]);
        }, 1500);
      }
    } catch (err) {
      console.error("Unexpected error loading history:", err);
      setError("Failed to load chat history");
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !guestId) return;

    const messageText = input.trim();
    const userMessage: Message = {
      role: "user",
      message: messageText,
      id: `user-${Date.now()}`,
      timestamp: new Date(),
    };

    setInput("");
    setError(null);
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Show typing indicator
    const typingMessage: Message = {
      role: "assistant",
      message: TYPING_MESSAGE,
      id: "typing",
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          guestId,
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const assistantReply = data.reply || "Sorry, I couldn't process your request. Please try again.";

      // Replace typing indicator with actual response
      setTimeout(() => {
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => msg.message !== TYPING_MESSAGE);
          return [
            ...withoutTyping,
            {
              role: "assistant",
              message: assistantReply,
              id: `assistant-${Date.now()}`,
              timestamp: new Date(),
            },
          ];
        });

        // Add suggestions if available
        if (data.parsed?.suggestions && data.parsed.suggestions.length > 0) {
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                role: "assistant",
                message: `__SUGGESTIONS__${JSON.stringify(data.parsed!.suggestions)}`,
                id: `suggestions-${Date.now()}`,
              },
            ]);
          }, 200);
        }
      }, 1500);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");

      // Remove typing indicator and show error
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.message !== TYPING_MESSAGE);
        return [
          ...withoutTyping,
          {
            role: "assistant",
            message: "Sorry, I'm having trouble connecting. Please try again.",
            id: `error-${Date.now()}`,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, guestId, userId]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Translation functionality
  const translateText = useCallback(async (messageIndex: number, targetLang: string) => {
    const message = messages[messageIndex]?.message;
    if (!message) return;

    // Store original text
    setOriginalTexts(prev => ({
      ...prev,
      [messageIndex]: prev[messageIndex] || message,
    }));

    // Reset to English (original)
    if (targetLang === "en") {
      setTranslatedMessages(prev => {
        const updated = { ...prev };
        delete updated[messageIndex];
        return updated;
      });
      setShowLangMenu(null);
      return;
    }

    // Check if translation already exists
    const existingTranslation = translatedMessages[messageIndex]?.[targetLang];
    if (existingTranslation) {
      setTranslatedMessages(prev => ({
        ...prev,
        [messageIndex]: {
          ...prev[messageIndex],
          activeLang: targetLang,
        },
      }));
      setShowLangMenu(null);
      return;
    }

    // Perform new translation
    try {
      setIsTranslating(true);
      setError(null);

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, targetLang }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();

      setTranslatedMessages(prev => ({
        ...prev,
        [messageIndex]: {
          ...(prev[messageIndex] || {}),
          [targetLang]: data.translatedText,
          activeLang: targetLang,
        },
      }));
    } catch (err) {
      console.error("Translation error:", err);
      setError("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
      setShowLangMenu(null);
    }
  }, [messages, translatedMessages]);

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    setError(null);
  }, []);

  // Suggestion click handler
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  // Memoized message components
  const messageComponents = useMemo(() => {
    return messages.map((message, index) => {
      // Handle suggestions
      if (message.message?.startsWith("__SUGGESTIONS__")) {
        const suggestions = JSON.parse(message.message.replace("__SUGGESTIONS__", ""));
        return (
          <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {suggestions.map((suggestion: string, idx: number) => (
              <button
                key={idx}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => handleSuggestionClick(suggestion)}
                aria-label={`Use suggestion: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        );
      }

      const isAssistant = message.role === "assistant";
      const cache = translatedMessages[index];
      const activeLang = cache?.activeLang;
      const displayMessage = activeLang ? cache[activeLang] : message.message;
      const isTyping = message.message === TYPING_MESSAGE;

      return (
        <motion.div
          key={message.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex flex-col",
            isAssistant ? "items-start" : "items-end"
          )}
        >
          {/* Translation button for assistant messages */}
          {isAssistant && !isTyping && (
            <div className="relative mb-1 self-start" ref={dropdownRef}>
              <button
                onClick={() => setShowLangMenu(prev => prev === index ? null : index)}
                className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Translate message"
                aria-expanded={showLangMenu === index}
                aria-haspopup="true"
              >
                <Globe className="w-3 h-3 inline mr-1" />
                Translate
              </button>

              <AnimatePresence>
                {showLangMenu === index && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 min-w-[120px]"
                    role="menu"
                    aria-label="Translation options"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => translateText(index, lang.code)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-accent focus:outline-none focus:bg-accent transition-colors"
                        role="menuitem"
                        disabled={isTranslating}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              "max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words",
              isAssistant
                ? "bg-card border border-border text-card-foreground rounded-bl-none"
                : "bg-primary text-primary-foreground rounded-br-none"
            )}
            role={isAssistant ? "status" : "log"}
            aria-live={isAssistant ? "polite" : "off"}
          >
            {isTyping ? (
              <motion.span
                className="text-muted-foreground italic"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                aria-label="Assistant is typing"
              >
                Assistant is typing...
              </motion.span>
            ) : (
              <span>{displayMessage}</span>
            )}
          </div>
        </motion.div>
      );
    });
  }, [messages, translatedMessages, showLangMenu, isTranslating, handleSuggestionClick, translateText]);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={toggleChat}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "fixed bottom-5 right-5 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-50",
              className
            )}
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-5 right-5 w-96 h-[65vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden z-50"
            role="dialog"
            aria-labelledby="chat-title"
            aria-describedby="chat-description"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div>
                <h2 id="chat-itle" className="font-semibold text-lg">
                  Barangay Konek Assistant 🤖
                </h2>
                <p id="chat-description" className="text-xs text-primary-foreground/70">
                  Ask about certificates, status, or verification
                </p>
              </div>
              <button
                onClick={toggleChat}
                className="text-sm bg-primary/20 hover:bg-primary/30 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border-b border-destructive/20 px-4 py-2"
                >
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30 relative">
              {isTranslating && (
                <div className="absolute top-2 right-3 text-xs text-muted-foreground italic animate-pulse">
                  Translating...
                </div>
              )}

              <div className="space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
                {messageComponents}
              </div>
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card p-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 text-foreground bg-background border border-input rounded-full px-4 py-2 focus:ring-2 focus:ring-ring focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ask about certificates, status, or verification..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                aria-label="Type your message"
              />
              <button
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⟳
                  </motion.span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
