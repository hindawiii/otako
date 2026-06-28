// Static English learning content — extracted verbatim from public/embeds/arena-rooms.html
import type {
  JpBotReply,
  JpBubble,
  JpChar,
  JpConversation,
  JpGreeting,
  JpQuiz,
  JpSentence,
  JpShortcut,
} from "./japanese";

export const enWords: JpChar[] = [
  { symbol: "Adventure", reading: "/ədˈvɛntʃər/", meaning: "مغامرة", type: "كلمة" },
  { symbol: "Determination", reading: "/dɪˌtɜːmɪˈneɪʃən/", meaning: "إصرار / عزيمة", type: "كلمة" },
  { symbol: "Friendship", reading: "/ˈfrɛndʃɪp/", meaning: "صداقة", type: "كلمة" },
  { symbol: "Power", reading: "/ˈpaʊər/", meaning: "قوة / قدرة", type: "كلمة" },
  { symbol: "Courage", reading: "/ˈkʌrɪdʒ/", meaning: "شجاعة", type: "كلمة" },
  { symbol: "Dream", reading: "/driːm/", meaning: "حلم", type: "كلمة" },
];

export const enGreetings: JpGreeting[] = [
  { icon: "🌅", target: "Good morning", reading: "/ɡʊd ˈmɔːrnɪŋ/", ar: "صباح الخير" },
  { icon: "😊", target: "How are you?", reading: "/haʊ ɑːr juː/", ar: "كيف حالك؟" },
  { icon: "🤝", target: "Nice to meet you", reading: "/naɪs tuː miːt juː/", ar: "تشرفت بلقائك" },
  { icon: "🙏", target: "Thank you very much", reading: "/θæŋk juː ˈvɛri mʌtʃ/", ar: "شكراً جزيلاً" },
  { icon: "👋", target: "See you later", reading: "/siː juː ˈleɪtər/", ar: "أراك لاحقاً" },
];

export const enSentences: JpSentence[] = [
  {
    level: "مبتدئ",
    target: "My name is ___",
    reading: "/maɪ neɪm ɪz/",
    ar: "اسمي هو ___",
    tags: ["👤 تعريف", "📝 قالب"],
    speakText: "My name is",
  },
  {
    level: "مبتدئ",
    target: "I like ___",
    reading: "/aɪ laɪk/",
    ar: "أنا أحب ___",
    tags: ["❤️ تفضيل", "🎌 أنمي"],
    speakText: "I like anime",
  },
  {
    level: "متوسط",
    target: "Where is ___?",
    reading: "/wɛər ɪz/",
    ar: "أين يقع ___؟",
    tags: ["📍 سؤال", "🗺️ اتجاهات"],
    speakText: "Where is the bathroom",
  },
  {
    level: "متقدم",
    target: "I will never give up",
    reading: "/aɪ wɪl ˈnɛvər ɡɪv ʌp/",
    ar: "لن أستسلم أبداً",
    tags: ["💪 تحفيز", "🎌 أنمي", "⭐ مميز"],
    speakText: "I will never give up",
  },
];

export const enConversation: JpConversation = {
  title: "في المكتبة 📚",
  bubbles: [
    {
      who: "them",
      avatar: "ل",
      avatarGradient: "linear-gradient(135deg,#9B59B6,#8E44AD)",
      target: "Can I help you find something?",
      reading: "/kæn aɪ hɛlp juː faɪnd ˈsʌmθɪŋ/",
      ar: "هل يمكنني مساعدتك في إيجاد شيء؟",
    },
    {
      who: "me",
      avatar: "أ",
      avatarGradient: "linear-gradient(135deg,#3498DB,#2980B9)",
      target: "I am looking for manga books",
      reading: "/aɪ æm ˈlʊkɪŋ fɔːr ˈmæŋɡə bʊks/",
      ar: "أبحث عن كتب المانجا",
    },
    {
      who: "them",
      avatar: "ل",
      avatarGradient: "linear-gradient(135deg,#9B59B6,#8E44AD)",
      target: "They are in section B, second floor",
      reading: "/ðeɪ ɑːr ɪn ˈsɛkʃən biː, ˈsɛkənd flɔːr/",
      ar: "هي في القسم ب، الطابق الثاني",
    },
  ],
};

export const enShortcuts: JpShortcut[] = [
  { short: "LOL", full: "Laugh Out Loud", meaning: "😂 ضحك بصوت عالٍ" },
  { short: "BRB", full: "Be Right Back", meaning: "⏳ سأعود الآن" },
  { short: "TBH", full: "To Be Honest", meaning: "🤔 بصراحة" },
  { short: "IMO", full: "In My Opinion", meaning: "💭 برأيي" },
  { short: "FYI", full: "For Your Information", meaning: "📢 لمعلوماتك" },
  { short: "ASAP", full: "As Soon As Possible", meaning: "⚡ في أقرب وقت" },
];

export const enQuiz: JpQuiz = {
  question: 'ما معنى "Determined"؟',
  speakText: "What does determined mean",
  options: [
    { label: "A) خائف", correct: false },
    { label: "B) مصمم / عازم", correct: true },
    { label: "C) سعيد", correct: false },
    { label: "D) غاضب", correct: false },
  ],
};

export const enBotReplies: JpBotReply[] = [
  {
    name: "Bot English",
    badge: "Bot",
    text: '💡 Tip: Try using "Where is ___?" to ask about places!',
    color: "#4ECDC4",
  },
  {
    name: "Sara",
    badge: "Beginner",
    text: "I'm also looking for a practice partner! 🙋‍♀️",
    color: "#9B59B6",
  },
];

export const enQuickReplies = [
  "🙏 Can you help me?",
  "❤️ Thanks for explaining!",
  "📝 I have a grammar question",
  "💬 Who wants to practice?",
];

export const enSeedMessages = [
  {
    name: "فاطمة",
    badge: "مبتدئ",
    time: "09:15",
    avatar: "ف",
    avatarGradient: "linear-gradient(135deg,#E74C3C,#C0392B)",
    html: 'هل يمكن لأحد أن يشرح لي الفرق بين <span class="lang-highlight">"Much"</span> و <span class="lang-highlight">"Many"</span>؟ 🤔',
    likes: 3,
  },
  {
    name: "أحمد",
    badge: "متوسط",
    time: "09:18",
    avatar: "أ",
    avatarGradient: "linear-gradient(135deg,#3498DB,#2980B9)",
    html: '@فاطمة <span class="lang-highlight">"Much"</span> للأشياء غير المعدودة (ماء، وقت) و <span class="lang-highlight">"Many"</span> للمعدودة (كتب، أصدقاء). 📚',
    likes: 9,
  },
];

// Re-export types for consumers that want them
export type { JpBubble };
