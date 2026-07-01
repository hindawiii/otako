// Drawing room content — extracted verbatim from arena-rooms.html
export interface DrawLesson {
  icon: string;
  target: string;
  reading: string;
  ar: string;
}

export interface DrawTool {
  symbol: string;
  reading: string;
  meaning: string;
}

export const drawLessons: DrawLesson[] = [
  {
    icon: "👁️",
    target: "رسم عيون الأنمي",
    reading: "الدرس 1: الأشكال الأساسية والتعبيرات",
    ar: "تعلم رسم 5 أنواع مختلفة من العيون",
  },
  {
    icon: "👤",
    target: "تناسق الوجه",
    reading: "الدرس 2: نسب الوجه والزوايا",
    ar: "قواعد تناسق الوجه في الأنمي",
  },
  {
    icon: "💇",
    target: "رسم الشعر",
    reading: "الدرس 3: الخصلات والحركة والظلال",
    ar: "تقنيات رسم الشعر الديناميكي",
  },
];

export const drawTools: DrawTool[] = [
  { symbol: "🖊️", reading: "قلم رصاص", meaning: "HB-2B للتخطيط" },
  { symbol: "🖌️", reading: "فرشاة", meaning: "تلوين دقيق" },
  { symbol: "💻", reading: "رقمي", meaning: "Procreate/PS" },
  { symbol: "📐", reading: "مسطرة", meaning: "للمنظور" },
];

export const drawGalleryShortcuts = [
  { short: "🖼️", full: "معرض الأعمال", meaning: "تصفح أعمال الأعضاء" },
  { short: "❤️", full: "التصويت", meaning: "صوت لأفضل رسمة" },
  { short: "📤", full: "ارفع رسمتك", meaning: "شارك تقدمك" },
  { short: "💬", full: "تعليقات", meaning: "احصل على نصائح" },
];

export const drawFeatured = {
  title: "رسمة الأسبوع",
  by: "by @سارة_الرسامة",
  desc: "شخصية أنمي أصلية - تفاصيل مذهلة في العيون والشعر!",
  tags: ["🎨 رقمي", "👁️ عيون", "🏆 تحدي"],
};

export const drawQuiz = {
  question: "ما هي نسبة رأس الشخصية الأنمي مقارنة بالجسم؟",
  options: [
    { label: "A) 1:4", correct: false },
    { label: "B) 1:7 (الواقعي) أو 1:5 (الشيبي)", correct: true },
    { label: "C) 1:10", correct: false },
    { label: "D) 1:2", correct: false },
  ],
};

export const drawChallenge = {
  title: "تحدي الأسبوع: رسم شخصية أنمي",
  desc: "الموضوع: شخصية من عالم ناروتو بأسلوبك الخاص",
  progress: 45,
  progressText: "45% - 9/20 مشاركة",
};

export const drawBotReplies = [
  { name: "بوت الرسم", badge: "بوت", text: "🖌️ ابدأ دائماً بالخطوط الخفيفة، ثم قوّها تدريجياً.", color: "#4ECDC4" },
  { name: "سارة", badge: "رسام", text: "جرّبوا التلوين بطبقات — يعطي عمقاً رائعاً للشعر ✨", color: "#9B59B6" },
];

export const drawQuickReplies = [
  "🎨 نصيحة في الرسم",
  "🖼️ شاركت رسمتك!",
  "✏️ أفضل الأدوات؟",
];

export const drawSeedMessages = [
  {
    name: "سارة",
    badge: "رسام",
    time: "14:00",
    avatar: "س",
    avatarGradient: "linear-gradient(135deg,#9B59B6,#8E44AD)",
    html: 'شاركتُ رسمتي الجديدة في المعرض! أحتاج نصائحكم في <span class="lang-highlight">تلوين الشعر</span> 🎨',
    likes: 8,
  },
];
