// Static Arabic (Fus'ha) learning content
export interface ArWord {
  symbol: string;
  reading: string;
  meaning: string;
  type: string;
}

export interface ArGreeting {
  icon: string;
  target: string;
  reading: string;
  ar: string;
}

export interface ArSentence {
  level: "مبتدئ" | "متوسط" | "متقدم";
  target: string;
  reading: string;
  ar: string;
  tags: string[];
  speakText: string;
}

export interface ArBubble {
  who: "them" | "me";
  avatar: string;
  avatarGradient: string;
  target: string;
  reading: string;
  ar: string;
}

export const arWords: ArWord[] = [
  { symbol: "كتاب", reading: "kitāb", meaning: "Book", type: "اسم" },
  { symbol: "مدرسة", reading: "madrasa", meaning: "School", type: "اسم" },
  { symbol: "جميل", reading: "jamīl", meaning: "Beautiful", type: "صفة" },
  { symbol: "يقرأ", reading: "yaqraʾ", meaning: "Reads", type: "فعل" },
  { symbol: "صديق", reading: "ṣadīq", meaning: "Friend", type: "اسم" },
  { symbol: "إلى", reading: "ilā", meaning: "To / Toward", type: "حرف" },
];

export const arGreetings: ArGreeting[] = [
  { icon: "🌅", target: "صباح الخير", reading: "ṣabāḥ al-khayr", ar: "Good morning" },
  { icon: "🌙", target: "مساء النور", reading: "masāʾ an-nūr", ar: "Good evening" },
  { icon: "🤝", target: "السلام عليكم", reading: "as-salāmu ʿalaykum", ar: "Peace be upon you" },
  { icon: "🙏", target: "شكراً جزيلاً", reading: "shukran jazīlan", ar: "Thank you very much" },
  { icon: "👋", target: "إلى اللقاء", reading: "ilā al-liqāʾ", ar: "Goodbye" },
];

export const arSentences: ArSentence[] = [
  {
    level: "مبتدئ",
    target: "اسمي ___",
    reading: "ismī ___",
    ar: "My name is ___",
    tags: ["👤 تعريف", "📝 قالب"],
    speakText: "اسمي",
  },
  {
    level: "مبتدئ",
    target: "أنا أحب ___",
    reading: "anā uḥibbu ___",
    ar: "I love ___",
    tags: ["❤️ تفضيل"],
    speakText: "أنا أحب",
  },
  {
    level: "متوسط",
    target: "أين يقع ___ ؟",
    reading: "ayna yaqaʿu ___?",
    ar: "Where is ___ located?",
    tags: ["📍 سؤال", "🗺️ اتجاهات"],
    speakText: "أين يقع",
  },
  {
    level: "متقدم",
    target: "إنّ العلم نورٌ والجهل ظلامٌ",
    reading: "inna al-ʿilma nūrun wa-l-jahla ẓalāmun",
    ar: "Knowledge is light and ignorance is darkness",
    tags: ["📚 حكمة"],
    speakText: "إن العلم نور والجهل ظلام",
  },
];

export const arConversation = {
  title: "في المكتبة 📚",
  bubbles: [
    {
      who: "them" as const,
      avatar: "أ",
      avatarGradient: "linear-gradient(135deg,#27AE60,#16A085)",
      target: "مرحباً، كيف يمكنني مساعدتك؟",
      reading: "marḥaban, kayfa yumkinunī musāʿadatuk?",
      ar: "Hello, how may I help you?",
    },
    {
      who: "me" as const,
      avatar: "م",
      avatarGradient: "linear-gradient(135deg,#16A085,#0E6B5A)",
      target: "أبحث عن كتابٍ في الأدب العربي",
      reading: "abḥathu ʿan kitābin fī al-adab al-ʿarabī",
      ar: "I am looking for a book on Arabic literature",
    },
    {
      who: "them" as const,
      avatar: "أ",
      avatarGradient: "linear-gradient(135deg,#27AE60,#16A085)",
      target: "تفضّل، الرفّ الثالث على يمينك",
      reading: "tafaḍḍal, ar-raff ath-thālith ʿalā yamīnik",
      ar: "Here you go, the third shelf on your right",
    },
  ],
};

export const arShortcuts = [
  { short: "إن شاء الله", full: "in shāʾa Allāh", meaning: "🤲 إذا أراد الله" },
  { short: "ما شاء الله", full: "mā shāʾa Allāh", meaning: "✨ تعجّب وثناء" },
  { short: "بإذن الله", full: "bi-idhni Allāh", meaning: "🙏 بمشيئة الله" },
  { short: "جزاك الله خيراً", full: "jazāka Allāhu khayran", meaning: "🌹 شكر وثناء" },
];

export const arQuiz = {
  question: 'ما معنى كلمة "صديق"؟',
  speakText: "صديق",
  options: [
    { label: "A) عدو", correct: false },
    { label: "B) صاحب / رفيق", correct: true },
    { label: "C) كتاب", correct: false },
    { label: "D) معلّم", correct: false },
  ],
};

export const arBotReplies = [
  {
    name: "بوت العربية",
    badge: "بوت",
    text: "💡 تلميح: ميّز بين الضاد والظاء — الضاد من حافة اللسان، والظاء من طرفه.",
    color: "#4ECDC4",
  },
  { name: "نورة", badge: "مبتدئ", text: "أحب الفصحى، من يقرأ معي قصيدة اليوم؟ 📖", color: "#9B59B6" },
];

export const arQuickReplies = [
  "🙏 هل من معينٍ على الإعراب؟",
  "❤️ شكراً على الشرح الوافي!",
  "🗣️ سؤال في النحو",
  "💬 من يتدرّب معي على الإملاء؟",
];

export const arSeedMessages = [
  {
    name: "نورة",
    badge: "مبتدئ",
    time: "09:10",
    avatar: "ن",
    avatarGradient: "linear-gradient(135deg,#9B59B6,#8E44AD)",
    html: 'ما الفرق بين <span class="lang-highlight">«إنّ»</span> و<span class="lang-highlight">«أنّ»</span>؟',
    likes: 7,
  },
  {
    name: "خالد",
    badge: "متوسط",
    time: "09:14",
    avatar: "خ",
    avatarGradient: "linear-gradient(135deg,#27AE60,#16A085)",
    html: '@نورة <span class="lang-highlight">«إنّ»</span> في بداية الكلام، و<span class="lang-highlight">«أنّ»</span> بعد فعل أو حرف.',
    likes: 15,
  },
  {
    name: "ليلى",
    badge: "متقدم",
    time: "09:20",
    avatar: "ل",
    avatarGradient: "linear-gradient(135deg,#E67E22,#D35400)",
    html: "شاركتُ ملخّصاً في «المرفوعات والمنصوبات» — مفيدٌ لمن يبدأ بالإعراب 📚",
    likes: 11,
  },
];
