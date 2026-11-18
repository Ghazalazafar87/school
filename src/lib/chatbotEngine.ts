import {
  CATEGORIES,
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  WHATSAPP_NUMBER_DISPLAY,
  formatPKR,
  getEffectivePrice,
} from '../data/catalog';
import { CategoryId, ChatMessage, Product } from '../types/store';

interface CategoryRule {
  categoryId: CategoryId;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    categoryId: 'school-bags',
    keywords: ['bag', 'bags', 'backpack', 'backpacks', 'rucksack', 'schoolbag'],
  },
  {
    categoryId: 'readers-books',
    keywords: ['book', 'books', 'reader', 'readers', 'story', 'stories', 'fable', 'fables', 'reading'],
  },
  {
    categoryId: 'lunch-boxes',
    keywords: ['lunch', 'lunchbox', 'bento', 'tiffin', 'food box', 'snack box'],
  },
  {
    categoryId: 'water-bottles',
    keywords: ['water', 'bottle', 'bottles', 'flask', 'thermos', 'hydration', 'sipper'],
  },
  {
    categoryId: 'pencil-pouches',
    keywords: ['pouch', 'pouches', 'pencil case', 'pencil holder', 'case', 'organizer'],
  },
  {
    categoryId: 'pens-markers',
    keywords: ['pen', 'pens', 'pencil', 'pencils', 'marker', 'markers', 'highlighter', 'fineliner', 'gel'],
  },
  {
    categoryId: 'notebooks-registers',
    keywords: ['notebook', 'notebooks', 'register', 'registers', 'copy', 'copies', 'journal', 'diary', 'spiral'],
  },
  {
    categoryId: 'painting-drawing',
    keywords: ['paint', 'painting', 'watercolor', 'acrylic', 'brush', 'brushes', 'sketchbook', 'drawing'],
  },
  {
    categoryId: 'art-craft',
    keywords: ['craft', 'origami', 'cardstock', 'washi', 'glue', 'scissors', 'paper pack'],
  },
  {
    categoryId: 'school-accessories',
    keywords: ['geometry', 'compass', 'ruler', 'calculator', 'sharpener', 'sticky', 'accessories', 'exam'],
  },
];

function extractMaxPrice(query: string): number | null {
  const match = query.match(/(?:under|below|less than|max|upto|up to|within)\s*(?:rs\.?|pkr)?\s*(\d[\d,]*)/i);
  if (!match) return null;
  const num = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(num) && num > 0 ? num : null;
}

function extractMinPrice(query: string): number | null {
  const match = query.match(/(?:above|over|more than|min)\s*(?:rs\.?|pkr)?\s*(\d[\d,]*)/i);
  if (!match) return null;
  const num = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function generateAssistantReply(
  userMessage: string,
  products: Product[]
): Omit<ChatMessage, 'id' | 'sender' | 'timestamp'> {
  const q = userMessage.trim().toLowerCase();

  // Greetings
  if (/^(hi|hello|salam|assalam|hey|aoa)\b/.test(q)) {
    const featured = products.filter((p) => p.isBestSeller && p.stock > 0).slice(0, 3);
    return {
      text: `Assalam-o-Alaikum! Welcome to Qalam & Paper. I can search our live store inventory by item, category, or PKR budget (for example: "water bottle under 1500" or "school bag"). Here are three customer favorites right now:`,
      suggestedProducts: featured,
      quickLinks: [{ label: 'Browse All Supplies', route: { page: 'shop' } }],
    };
  }

  // Delivery / COD / Payment / WhatsApp questions
  if (/(delivery|shipping|cod|cash on delivery|payment|jazzcash|easypaisa|city|lahore|karachi|islamabad)/.test(q)) {
    return {
      text: `We ship across Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta. Cash on Delivery (COD) is available nationwide! Standard shipping is ${formatPKR(STANDARD_DELIVERY_FEE)}, and orders of ${formatPKR(FREE_DELIVERY_THRESHOLD)} or more qualify for Free Delivery.`,
      quickLinks: [
        { label: 'Go to Checkout', route: { page: 'checkout' } },
        { label: 'View My Orders', route: { page: 'orders' } },
      ],
    };
  }

  if (/(whatsapp|contact|phone|number|call|support|help|return)/.test(q)) {
    return {
      text: `You can reach our store team directly on WhatsApp or phone at ${WHATSAPP_NUMBER_DISPLAY} (wa.me/923126687237) for bulk school orders, custom lists, or delivery updates.`,
      quickLinks: [{ label: 'Open Contact Page', route: { page: 'contact' } }],
    };
  }

  if (/(order|track|history|previous)/.test(q)) {
    return {
      text: `All your demo orders are saved automatically in your browser's LocalStorage. You can inspect past order receipts and status from the Orders page.`,
      quickLinks: [{ label: 'View Order History', route: { page: 'orders' } }],
    };
  }

  // Parse filters from query
  const maxPrice = extractMaxPrice(q);
  const minPrice = extractMinPrice(q);
  const wantsDiscount = /(discount|offer|sale|deal|save|off)/.test(q);
  const wantsBest = /(best|popular|top|recommend)/.test(q);
  const wantsNew = /(new|latest|arrival)/.test(q);
  const wantsBudget = /(cheap|budget|affordable|low price)/.test(q);

  // Detect category matches
  const matchedCategories = CATEGORY_RULES.filter((rule) =>
    rule.keywords.some((kw) => q.includes(kw))
  ).map((r) => r.categoryId);

  // Token search
  const stopWords = new Set([
    'show', 'me', 'find', 'search', 'for', 'a', 'an', 'the', 'is', 'are', 'in', 'under', 'below',
    'above', 'less', 'than', 'rs', 'pkr', 'price', 'available', 'stock', 'have', 'do', 'you',
    'need', 'want', 'buy', 'looking', 'with', 'and', 'or', 'some', 'any', 'please', 'of',
  ]);
  const tokens = q
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !stopWords.has(t) && !/^\d+$/.test(t));

  let candidates = products.slice();

  if (matchedCategories.length > 0) {
    candidates = candidates.filter((p) => matchedCategories.includes(p.category));
  }

  if (wantsDiscount) {
    candidates = candidates.filter((p) => Boolean(p.discountPrice && p.discountPrice < p.price));
  }

  if (maxPrice !== null) {
    candidates = candidates.filter((p) => getEffectivePrice(p) <= maxPrice);
  }

  if (minPrice !== null) {
    candidates = candidates.filter((p) => getEffectivePrice(p) >= minPrice);
  }

  // Score by token relevance against product name, description, highlights, category name
  const scored = candidates
    .map((p) => {
      const catName = CATEGORIES.find((c) => c.id === p.category)?.name.toLowerCase() ?? '';
      const haystack = `${p.name} ${p.description} ${p.highlights.join(' ')} ${catName}`.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (p.name.toLowerCase().includes(token)) score += 5;
        else if (catName.includes(token)) score += 3;
        else if (haystack.includes(token)) score += 2;
      }
      if (wantsBest && p.isBestSeller) score += 4;
      if (wantsNew && p.isNewArrival) score += 4;
      if (p.stock > 0) score += 1;
      return { product: p, score };
    })
    .filter((item) => {
      if (matchedCategories.length > 0 || wantsDiscount || maxPrice !== null || minPrice !== null || wantsBest || wantsNew || wantsBudget) {
        return true;
      }
      return item.score > 1;
    });

  if (wantsBudget) {
    scored.sort((a, b) => getEffectivePrice(a.product) - getEffectivePrice(b.product));
  } else if (wantsBest) {
    scored.sort((a, b) => b.product.rating - a.product.rating || b.score - a.score);
  } else {
    scored.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
  }

  const topMatches = scored.slice(0, 3).map((s) => s.product);

  if (topMatches.length > 0) {
    const categoryLabel =
      matchedCategories.length === 1
        ? CATEGORIES.find((c) => c.id === matchedCategories[0])?.name
        : null;

    let intro = `Here are ${topMatches.length} matching ${topMatches.length === 1 ? 'item' : 'items'} from our live catalogue`;
    if (categoryLabel) intro += ` in ${categoryLabel}`;
    if (maxPrice !== null) intro += ` under ${formatPKR(maxPrice)}`;
    if (wantsDiscount) intro += ` with active discounts`;
    intro += `. You can add any item directly to your cart or open its details:`;

    return {
      text: intro,
      suggestedProducts: topMatches,
      quickLinks:
        matchedCategories.length === 1
          ? [
              {
                label: `Browse all ${categoryLabel}`,
                route: { page: 'shop', category: matchedCategories[0] },
              },
            ]
          : [{ label: 'Open Full Catalog', route: { page: 'shop' } }],
    };
  }

  // Fallback when nothing matched exact filters
  const fallbackRecommendations = products.filter((p) => p.isBestSeller && p.stock > 0).slice(0, 2);
  return {
    text: `I could not find an exact in-stock match for "${userMessage}" with those filters. Try searching by category (like School Bags, Notebooks, Water Bottles, Story Books, or Painting Supplies) or ask for items under a PKR budget. Meanwhile, here are two popular school essentials:`,
    suggestedProducts: fallbackRecommendations,
    quickLinks: [
      { label: 'Browse All 10 Categories', route: { page: 'shop' } },
      { label: `WhatsApp ${WHATSAPP_NUMBER_DISPLAY}`, route: { page: 'contact' } },
    ],
  };
}
