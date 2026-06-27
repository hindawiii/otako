
# المرحلة 2 — تفكيك غرفة اليابانية إلى مكونات React

## الهدف
نقل غرفة `🇯🇵 اليابانية` فقط من `public/embeds/arena-rooms.html` إلى مكونات React/Tailwind/shadcn، مع الحفاظ على التصميم والوظائف 100%. لا مساس بأي قسم آخر ولا بـ `arena.tsx`.

## الملفات الجديدة
```text
src/components/
├── shared/
│   ├── ChatBox.tsx        # صندوق محادثة قابل لإعادة الاستخدام (مع ردود بوت)
│   ├── QuizCard.tsx       # بطاقة اختبار + تصحيح فوري + زر نطق
│   └── ProgressBar.tsx    # شريط تقدم (gradient ديناميكي حسب الغرفة)
└── rooms/
    ├── JapaneseRoom.tsx           # الحاوية: header + Tabs (shadcn)
    └── japanese/
        ├── CharactersTab.tsx      # الأحرف + التحيات (حرف اليوم)
        ├── GreetingsTab.tsx       # قائمة التحيات مع نطق عادي/بطيء
        ├── SentencesTab.tsx       # الجمل (تبويب «الجمل»)
        ├── ConversationsTab.tsx   # ChatBox + بوت اليابانية
        └── LevelTab.tsx           # ProgressBar + QuizCard + إحصاءات
```
> ملاحظة: الـ HTML الأصلي يحتوي 4 تبويبات (الأحرف، الجمل، المحادثات، مستواي). سأُنشئ كل الملفات المطلوبة في طلبك، ويُدمج محتوى «التحيات» داخل `CharactersTab` (كما في الأصل) مع إبقاء `GreetingsTab.tsx` كمكوّن قابل للاستخدام مستقبلاً.

## التصميم
- Tailwind فقط + shadcn `Tabs` / `Button` / `Card`.
- ألوان ثابتة عبر CSS variables محلية داخل `JapaneseRoom.tsx`:
  ```css
  --japanese:#E74C3C; --accent:#FFE66D; --secondary:#4ECDC4; --dark:#0a0a1a;
  ```
- خلفية نجوم + `@keyframes fadeInUp`, `twinkle` تُضاف عبر `<style>` محلي داخل `JapaneseRoom.tsx` (لا تعديل لـ `src/styles.css`).
- نفس التخطيط: header card، corner tabs، daily cards، grids للأحرف، قائمة التحيات، فقاعات المحادثة.

## الوظائف
- **النطق**: hook `useSpeak()` في `src/lib/useSpeak.ts` يستخدم `window.speechSynthesis` مع `lang="ja-JP"` و `rate` (normal/slow) — مطابق لـ `speakJP` الأصلية.
- **التبديل**: `Tabs` من shadcn (4 تبويبات).
- **الشات**: `ChatBox` يدير رسائل محلية + ردود بوت ثابتة (من الـ HTML الأصلي) — بدون Firebase الآن (سيُضاف لاحقاً عبر props).
- **الاختبار**: `QuizCard` يأخذ `question/options/correctIndex` ويعرض تصحيح فوري.
- **التقدم**: `ProgressBar` بنسبة قابلة للتمرير + حفظ في `localStorage` بمفتاح `jp_progress` عبر `guest-storage`.

## البيانات
- ملف static واحد: `src/lib/data/japanese.ts` يحتوي `characters`, `greetings`, `sentences`, `botReplies`, `quiz` — مستخرج حرفياً من الـ HTML.

## القواعد الصارمة
- ✋ لا تعديل لـ `arena.tsx` ولا للأقسام الأخرى.
- ✋ لا حذف لـ `arena-rooms.html` (يبقى مرجعاً).
- ✋ لا Lovable Cloud في هذه المرحلة.
- ✅ المكوّنات معزولة تماماً — قابلة للاختبار بصفحة preview منفصلة لاحقاً.

## التحقق
- بناء ناجح (`tsgo`).
- مراجعة بصرية عبر استيراد مؤقت في صفحة اختبار محلية (ثم حذفها) — أو الانتظار للمرحلة 3 لربطها بـ `arena.tsx`.

## ما بعد هذه المرحلة (للعلم فقط)
- المرحلة 3: ربط `JapaneseRoom` بـ `arena.tsx` واستبدال الـ iframe جزئياً.
- المرحلة 4: تكرار نفس النمط للغرف الأخرى (إنجليزية، عربية…).

هل أبدأ التنفيذ؟ 🛠️
