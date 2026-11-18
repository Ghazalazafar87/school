import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, MessageSquare, Send, ShoppingBag, X } from 'lucide-react';
import { WHATSAPP_BASE_URL, WHATSAPP_NUMBER_DISPLAY, formatPKR, getEffectivePrice } from '../data/catalog';
import { generateAssistantReply } from '../lib/chatbotEngine';
import { useStore } from '../context/StoreContext';
import { ChatMessage } from '../types/store';
import { ProductImage } from './ProductImage';

const QUICK_PROMPTS = [
  'School bags',
  'Water bottle under 1500',
  'Special offers',
  'Watercolor & drawing',
  'COD delivery details',
];

export const ShoppingChatbot: React.FC = () => {
  const {
    store,
    chatbotOpen,
    setChatbotOpen,
    navigate,
    addToCart,
  } = useStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Assalam-o-Alaikum! Ask me to find school bags, notebooks, pens, story books, art supplies, items under a PKR budget, or Cash on Delivery info.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatbotOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatbotOpen]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const reply = generateAssistantReply(trimmed, store.products);
    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      ...reply,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {/* Chatbot Panel */}
      {chatbotOpen && (
        <section
          aria-label="Shopping Assistant"
          className="w-[calc(100vw-2rem)] sm:w-[390px] max-h-[75vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="font-display text-sm font-bold leading-tight">
                Qalam &amp; Paper Assistant
              </h2>
              <p className="text-[11px] text-slate-300">
                Searches live LocalStorage catalogue
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChatbotOpen(false)}
              aria-label="Close assistant"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-700 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggested Products inside Chat */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {msg.suggestedProducts.map((product) => {
                      const price = getEffectivePrice(product);
                      const outOfStock = product.stock <= 0;
                      return (
                        <div
                          key={product.id}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2.5"
                        >
                          <div
                            onClick={() => {
                              navigate({ page: 'product', slug: product.slug });
                              setChatbotOpen(false);
                            }}
                            className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                          >
                            <ProductImage src={product.image} alt={product.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              onClick={() => {
                                navigate({ page: 'product', slug: product.slug });
                                setChatbotOpen(false);
                              }}
                              className="text-xs font-semibold text-slate-900 truncate cursor-pointer hover:text-blue-700"
                            >
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-slate-800 tabular-nums mt-0.5">
                              {formatPKR(price)}{' '}
                              <span className="font-normal text-slate-500">
                                · {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
                              </span>
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={outOfStock}
                            onClick={() =>
                              addToCart(product.id, product.variations[0]?.name, 1, false)
                            }
                            aria-label={`Add ${product.name} to cart`}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-700 text-white text-[11px] font-semibold hover:bg-blue-800 disabled:opacity-50 shrink-0 inline-flex items-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Navigation Links */}
                {msg.quickLinks && msg.quickLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.quickLinks.map((ql) => (
                      <button
                        key={ql.label}
                        type="button"
                        onClick={() => {
                          navigate(ql.route);
                          setChatbotOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        {ql.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Suggestion Prompts */}
          <div className="px-3 py-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto shrink-0">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about bags, pens, or PKR budget..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="p-2.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      {/* Compact Floating Action Dock: WhatsApp + Assistant */}
      <div className="flex items-center gap-2">
        <a
          href={WHATSAPP_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat on WhatsApp (${WHATSAPP_NUMBER_DISPLAY})`}
          title={`WhatsApp ${WHATSAPP_NUMBER_DISPLAY}`}
          className="h-11 px-3.5 rounded-full bg-emerald-700 text-white shadow-lg hover:bg-emerald-800 transition-colors inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setChatbotOpen(!chatbotOpen)}
          aria-label={chatbotOpen ? 'Close product assistant' : 'Open product assistant'}
          className="h-11 px-4 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
        >
          {chatbotOpen ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          <span>{chatbotOpen ? 'Close' : 'Shop Help'}</span>
        </button>
      </div>
    </div>
  );
};
