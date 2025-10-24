"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/config/client";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function ChatWidget({ userId = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [originalTexts, setOriginalTexts] = useState({});
  const endRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🧭 Load guest ID and chat history
  useEffect(() => {
    let g = localStorage.getItem("bk_guest_id");
    if (!g) {
      g = uuidv4();
      localStorage.setItem("bk_guest_id", g);
    }
    setGuestId(g);

    if (isOpen) {
      loadHistory(g, userId);
    }
  }, [isOpen, userId]);

  // 🧩 Load previous messages or show animated greeting
  async function loadHistory(gid, uid) {
    const { data, error } = await supabase
      .from("chatbot_messages")
      .select("role, message, created_at")
      .or(uid ? `user_id.eq.${uid}` : `guest_id.eq.${gid}`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const formatted = data.map((d) => ({ role: d.role, message: d.message }));

      if (!formatted.length) {
        // Step 1: show typing indicator
        setMessages([{ role: "assistant", message: "💬 Assistant is typing..." }]);

        // Step 2: show real greeting after 1.5 seconds
        setTimeout(() => {
          setMessages([
            {
              role: "assistant",
              message: "👋 Hello! How may I assist you today?",
            },
          ]);
        }, 1500);
      } else {
        setMessages(formatted);
      }
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  // ✉️ Send user message
  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", message: text }]);
    setLoading(true);

    // 🧠 Show typing indicator while waiting for assistant reply
    setMessages((m) => [
      ...m,
      { role: "assistant", message: "💬 Assistant is typing..." },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, guestId, message: text }),
      });

      const d = await res.json();
      const assistant = d.reply || "Sorry, can you say that again?";

      // ⏳ Delay to simulate typing before showing real message
      setTimeout(() => {
        setMessages((m) => {
          const withoutTyping = m.filter(
            (msg) => msg.message !== "💬 Assistant is typing..."
          );
          return [...withoutTyping, { role: "assistant", message: assistant }];
        });
      }, 1500);

      // Add optional suggestions
      if (d.parsed?.suggestions) {
        setTimeout(() => {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              message: `__SUGGESTIONS__${JSON.stringify(d.parsed.suggestions)}`,
            },
          ]);
        }, 1700);
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m.filter((msg) => msg.message !== "💬 Assistant is typing..."),
        { role: "assistant", message: "Sorry, can you say that again?" },
      ]);
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  // 🌐 Translation logic
  const translateText = async (index, targetLang) => {
    const msg = messages[index]?.message;
    if (!msg) return;

    setOriginalTexts((prev) => ({
      ...prev,
      [index]: prev[index] || msg,
    }));

    if (targetLang === "en") {
      setTranslatedMessages((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setShowLangMenu(null);
      return;
    }

    const existingTranslation = translatedMessages[index]?.[targetLang];
    if (existingTranslation) {
      setTranslatedMessages((prev) => ({
        ...prev,
        [index]: { ...prev[index], activeLang: targetLang },
      }));
      setShowLangMenu(null);
      return;
    }

    try {
      setIsTranslating(true);
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg, targetLang }),
      });

      if (!response.ok) throw new Error("Translation failed");
      const data = await response.json();

      setTranslatedMessages((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [targetLang]: data.translatedText,
          activeLang: targetLang,
        },
      }));
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
      setShowLangMenu(null);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <motion.button
          onClick={toggleChat}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-5 right-5 w-96 h-[65vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Barangay Konek Assistant 🤖</h2>
            <button
              onClick={toggleChat}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded-md"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 relative">
            {isTranslating && (
              <div className="absolute top-2 right-3 text-xs text-gray-500 italic animate-pulse">
                Translating...
              </div>
            )}

            {messages.map((m, i) => {
              if (m.message?.startsWith("__SUGGESTIONS__")) {
                const suggestions = JSON.parse(
                  m.message.replace("__SUGGESTIONS__", "")
                );
                return (
                  <div key={i} className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                        onClick={() => setInput(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                );
              }

              const isAssistant = m.role === "assistant";
              const cache = translatedMessages[i];
              const activeLang = cache?.activeLang;
              const displayMessage = activeLang
                ? cache[activeLang]
                : messages[i]?.message;

              const isTyping = m.message === "💬 Assistant is typing...";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${
                    isAssistant ? "items-start" : "items-end"
                  }`}
                >
                  {/* 🌐 Translate Button (Assistant only) */}
                  {isAssistant && !isTyping && (
                    <div className="relative mb-1 self-start" ref={dropdownRef}>
                      <button
                        onClick={() =>
                          setShowLangMenu((s) => (s === i ? null : i))
                        }
                        className="text-xs text-gray-600 hover:text-blue-600 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition"
                      >
                        🌐 Translate
                      </button>
                      {showLangMenu === i && (
                        <div className="absolute left-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                          <button
                            onClick={() => translateText(i, "en")}
                            className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                          >
                            English
                          </button>
                          <button
                            onClick={() => translateText(i, "ceb")}
                            className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                          >
                            Bisaya
                          </button>
                          <button
                            onClick={() => translateText(i, "tl")}
                            className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                          >
                            Tagalog
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      isAssistant
                        ? "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                        : "bg-blue-600 text-white rounded-br-none"
                    }`}
                  >
                    {isTyping ? (
                      <motion.span
                        className="text-gray-500 italic"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Assistant is typing...
                      </motion.span>
                    ) : (
                      <span>{displayMessage}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3 flex gap-2">
            <input
              type="text"
              className="flex-1 text-black border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              placeholder="Ask about certificates, status, or verification..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-full transition"
              onClick={send}
              disabled={loading}
            >
              {loading ? <span className="animate-pulse">...</span> : "Send"}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
