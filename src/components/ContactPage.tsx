import React, { useState } from 'react';
import { Clock, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { WHATSAPP_BASE_URL, WHATSAPP_NUMBER_DISPLAY } from '../data/catalog';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || message.trim().length < 5) {
      showToast('Please enter your name and message.', 'error');
      return;
    }
    showToast('Inquiry prepared! Opening WhatsApp or you can chat directly.');
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Qalam & Paper!\nName: ${name.trim()}\nPhone: ${phone.trim() || 'N/A'}\nCity: ${city}\nMessage: ${message.trim()}`
    );
    window.open(`${WHATSAPP_BASE_URL}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
          Customer Support
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Contact Qalam &amp; Paper
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          Need help with a school booklist, bulk classroom stationery quote, or Cash on Delivery tracking? Message us directly on WhatsApp or send an inquiry below.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Direct Contact Channels */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">WhatsApp Order Desk</h2>
                <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
                  {WHATSAPP_NUMBER_DISPLAY}
                </p>
                <a
                  href={WHATSAPP_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Phone Support</h2>
                <a
                  href={`tel:${WHATSAPP_NUMBER_DISPLAY}`}
                  className="text-sm text-blue-700 font-medium hover:underline tabular-nums mt-0.5 inline-block"
                >
                  {WHATSAPP_NUMBER_DISPLAY}
                </a>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct voice &amp; WhatsApp support for parents and schools
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Nationwide Dispatch</h2>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Delivering Cash on Delivery parcels across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and all major Pakistani cities.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Support Hours</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Monday – Saturday · 9:00 AM to 8:00 PM PKT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Send a School Supply or Order Inquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your list or question and continue directly in WhatsApp with our store team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bilal Ahmed"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lahore / Karachi / Islamabad"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Message or School List *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about product availability, bulk notebooks, or custom school kits..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send via WhatsApp ({WHATSAPP_NUMBER_DISPLAY})
          </button>
        </form>
      </div>
    </div>
  );
};
