// Welcome / Onboarding room content — extracted verbatim from arena-rooms.html
export interface WelcomeStep {
  n: string;
  target: string;
  reading: string;
  ar: string;
}

export interface WelcomeRule {
  icon: string;
  target: string;
  reading: string;
  ar: string;
}

export interface WelcomeNewbie {
  emoji: string;
  name: string;
  level: string;
}

export const welcomeSteps: WelcomeStep[] = [
  {
    n: "1️⃣",
    target: "اختر غرفتك المفضلة",
    reading: "استكشف غرف التعلم: يابانية، إنجليزية، عربية، رسم، ألعاب، موسيقى",
    ar: "كل غرفة لها محتوى تعليمي متخصص وبوت ذكي",
  },
  {
    n: "2️⃣",
    target: "اختبر مستواك",
    reading: "اختبار سريع لتحديد مستواك في اللغة أو المهارة المختارة",
    ar: "احصل على توصيات مخصصة بناءً على نتيجتك",
  },
  {
    n: "3️⃣",
    target: "تفاعل مع المجتمع",
    reading: "شارك في المحادثات، اطرح أسئلة، وساعد الآخرين",
    ar: "اكسب نقاط الخبرة (XP) وارتقِ في المستويات",
  },
  {
    n: "4️⃣",
    target: "استخدم البوت التعليمي",
    reading: "بوت ذكي يساعدك في التعلم والتدريب اليومي",
    ar: "اطلب شرحاً، تمريناً، أو محادثة تدريبية",
  },
];

export const welcomeQuiz = {
  question: "ما هو مجال اهتمامك الرئيسي؟",
  options: [
    { label: "A) تعلم اللغات (يابانية/إنجليزية/عربية)", correct: true },
    { label: "B) الرسم والفنون", correct: false },
    { label: "C) الألعاب والموسيقى", correct: false },
    { label: "D) كل ما سبق!", correct: false },
  ],
};

export const welcomeRules: WelcomeRule[] = [
  {
    icon: "🤝",
    target: "احترام الجميع",
    reading: "لا للتنمر أو الإهانة بأي شكل",
    ar: "مجتمعنا يقوم على الاحترام المتبادل",
  },
  {
    icon: "📵",
    target: "لا للحرق",
    reading: "منع حرق أحداث الأنمي/المانجا دون تحذير",
    ar: "استخدم علامة التحذير ⚠️ Spoiler",
  },
  {
    icon: "🎯",
    target: "التركيز على التعلم",
    reading: "الغرف التعليمية للتعلم فقط",
    ar: "استخدم ساحة الأوتاكو للمحادثات العامة",
  },
];

export const welcomeNewbies: WelcomeNewbie[] = [
  { emoji: "🌸", name: "سارة", level: "مستوى: مبتدئ" },
  { emoji: "⚔️", name: "خالد", level: "مستوى: متوسط" },
  { emoji: "🎨", name: "نور", level: "مستوى: متقدم" },
];

export const welcomeBotReplies = [
  { name: "بوت الاستقبال", badge: "بوت", text: "👋 أهلاً بك! اسأل عن أي غرفة وسأدلّك عليها.", color: "#4ECDC4" },
  { name: "نور", badge: "متقدم", text: "أنصحك بالبدء بغرفة اللغة المفضلة لديك ثم غرفة الرسم 🎨", color: "#FFE66D" },
];

export const welcomeQuickReplies = [
  "👋 أهلاً! أنا جديد",
  "🎯 أفضل غرفة للمبتدئين؟",
  "🎌 أحب أنمي ___",
];

export const welcomeSeedMessages = [
  {
    name: "أحمد",
    badge: "جديد",
    time: "09:00",
    avatar: "أ",
    avatarGradient: "linear-gradient(135deg,#FF6B6B,#FF8E8E)",
    html: 'أهلاً بالجميع! أنا جديد هنا وأحب أنمي <span class="lang-highlight">ناروتو</span> وون بيس 🍥⚔️',
    likes: 5,
  },
];
