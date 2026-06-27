// Static Japanese learning content — extracted verbatim from public/embeds/arena-rooms.html
export type CharType = "هيراغانا" | "كاتاكانا" | "كانجي" | "كلمة";

export interface JpChar {
  symbol: string;
  reading: string;
  meaning: string;
  type: CharType;
}

export interface JpGreeting {
  icon: string;
  target: string;
  reading: string;
  ar: string;
}

export interface JpSentence {
  level: "مبتدئ" | "متوسط" | "متقدم";
  target: string;
  reading: string;
  ar: string;
  tags: string[];
  speakText: string;
}

export interface JpBubble {
  who: "them" | "me";
  avatar: string;
  avatarGradient: string;
  target: string;
  reading: string;
  ar: string;
}

export interface JpConversation {
  title: string;
  bubbles: JpBubble[];
}

export interface JpShortcut {
  short: string;
  full: string;
  meaning: string;
}

export interface JpQuiz {
  question: string;
  speakText: string;
  options: { label: string; correct: boolean }[];
}

export interface JpBotReply {
  name: string;
  badge: string;
  text: string;
  color: string;
}

export const jpCharacters: JpChar[] = [
  { symbol: "あ", reading: "a", meaning: 'صوت "أ"', type: "هيراغانا" },
  { symbol: "い", reading: "i", meaning: 'صوت "إي"', type: "هيراغانا" },
  { symbol: "う", reading: "u", meaning: 'صوت "أو"', type: "هيراغانا" },
  { symbol: "ア", reading: "a", meaning: 'صوت "أ"', type: "كاتاكانا" },
  { symbol: "日", reading: "hi / nichi", meaning: "شمس / يوم", type: "كانجي" },
  { symbol: "こんにちは", reading: "konnichiwa", meaning: "مرحباً", type: "كلمة" },
];

export const jpGreetings: JpGreeting[] = [
  { icon: "🌅", target: "おはようございます", reading: "Ohayou gozaimasu", ar: "صباح الخير (رسمي)" },
  { icon: "☀️", target: "こんにちは", reading: "Konnichiwa", ar: "مرحباً / مساء الخير" },
  { icon: "🌙", target: "こんばんは", reading: "Konbanwa", ar: "مساء الخير" },
  { icon: "😴", target: "おやすみなさい", reading: "Oyasuminasai", ar: "تصبح على خير" },
  { icon: "🙏", target: "ありがとうございます", reading: "Arigatou gozaimasu", ar: "شكراً جزيلاً" },
];

export const jpSentences: JpSentence[] = [
  {
    level: "مبتدئ",
    target: "わたしの名前は___です",
    reading: "Watashi no namae wa ___ desu",
    ar: "اسمي هو ___",
    tags: ["👤 تعريف", "📝 قالب"],
    speakText: "わたしの名前はです",
  },
  {
    level: "مبتدئ",
    target: "___が好きです",
    reading: "___ ga suki desu",
    ar: "أنا أحب ___",
    tags: ["❤️ تفضيل", "📝 قالب"],
    speakText: "が好きです",
  },
  {
    level: "متوسط",
    target: "___はどこですか",
    reading: "___ wa doko desu ka",
    ar: "أين يقع ___؟",
    tags: ["📍 سؤال", "🗺️ اتجاهات"],
    speakText: "はどこですか",
  },
];

export const jpConversation: JpConversation = {
  title: "في المقهى ☕",
  bubbles: [
    {
      who: "them",
      avatar: "س",
      avatarGradient: "linear-gradient(135deg,#9B59B6,#8E44AD)",
      target: "いらっしゃいませ！何名様ですか",
      reading: "Irasshaimase! Nan mei sama desu ka",
      ar: "أهلاً وسهلاً! كم شخص؟",
    },
    {
      who: "me",
      avatar: "أ",
      avatarGradient: "linear-gradient(135deg,#E74C3C,#C0392B)",
      target: "一人です",
      reading: "Hitori desu",
      ar: "شخص واحد",
    },
  ],
};

export const jpShortcuts: JpShortcut[] = [
  { short: "w", full: "warau (笑う)", meaning: "😂 ضحك" },
  { short: "www", full: "ضحك ×3", meaning: "😂😂😂 ضحك كثير" },
  { short: "orz", full: "شخص راكع", meaning: "🙇 اعتذار / خيبة" },
  { short: "ktkr", full: "kita kore", meaning: "🔥 لحظة حاسمة!" },
];

export const jpQuiz: JpQuiz = {
  question: 'ما معنى "ありがとう"؟',
  speakText: "ありがとう",
  options: [
    { label: "A) مع السلامة", correct: false },
    { label: "B) شكراً", correct: true },
    { label: "C) صباح الخير", correct: false },
    { label: "D) أهلاً", correct: false },
  ],
};

export const jpBotReplies: JpBotReply[] = [
  {
    name: "بوت اليابانية",
    badge: "بوت",
    text: "💡 تلميح: جرب استخدام القالب 「___はどこですか」 للسؤال عن الأماكن!",
    color: "#4ECDC4",
  },
  { name: "سارة", badge: "مبتدئ", text: "أنا أيضاً أبحث عن شريك للتدرب! 🙋‍♀️", color: "#9B59B6" },
];

export const jpQuickReplies = [
  "🙏 هل يمكنكم مساعدتي؟",
  "❤️ شكراً على الشرح!",
  "🗣️ سؤال عن النطق",
  "💬 من يريد التدرب معي؟",
];

export const jpSeedMessages = [
  {
    name: "سارة",
    badge: "مبتدئ",
    time: "10:30",
    avatar: "س",
    avatarGradient: "linear-gradient(135deg,#9B59B6,#8E44AD)",
    html: 'مرحباً جميعاً! هل يمكنكم مساعدتي في نطق <span class="lang-highlight">「ら」</span>؟ أجد صعوبة في تمييزها عن <span class="lang-highlight">「な」</span>',
    likes: 5,
  },
  {
    name: "محمد",
    badge: "متوسط",
    time: "10:32",
    avatar: "م",
    avatarGradient: "linear-gradient(135deg,#3498DB,#2980B9)",
    html: '@سارة الفرق بسيط! <span class="lang-highlight">「ら」</span> تنطق "را" بينما <span class="lang-highlight">「な」</span> تنطق "نا".',
    likes: 12,
  },
  {
    name: "عمر",
    badge: "متقدم",
    time: "10:35",
    avatar: "ع",
    avatarGradient: "linear-gradient(135deg,#27AE60,#2ECC71)",
    html: "شاركتُ ملخصاً لقواعد الـ particles في قسم الجمل الشائعة! مفيد جداً للمبتدئين 📚✨",
    likes: 8,
  },
];
