import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية — أوتاكو" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-screen-md px-4 py-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" /> العودة للرئيسية
        </Link>
        <h1 className="mb-6 text-3xl font-black text-gradient">سياسة الخصوصية</h1>

        <Card className="space-y-4 p-6 text-sm leading-7">
          <p>
            في «أوتاكو» نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة كيفية جمع المعلومات واستخدامها وحمايتها داخل المنصة.
          </p>
          <h2 className="text-base font-bold">١. البيانات التي نجمعها</h2>
          <p>نجمع البريد الإلكتروني، اسم المستخدم، الاسم المستعار، النبذة، والصورة الرمزية، إضافة إلى بيانات الاستخدام الضرورية لتشغيل الخدمة.</p>
          <h2 className="text-base font-bold">٢. كيف نستخدم بياناتك</h2>
          <p>تُستخدم بياناتك لإنشاء حسابك، تخصيص تجربتك، ضمان الأمان، والتواصل معك بشأن الخدمة.</p>
          <h2 className="text-base font-bold">٣. الأمان والإبلاغ</h2>
          <p>يحتوي التطبيق على أدوات إبلاغ على جميع العناصر التفاعلية، ويراجع فريق الإشراف البلاغات بانتظام.</p>
          <h2 className="text-base font-bold">٤. حقوقك</h2>
          <p>يحق لك تعديل بياناتك أو طلب حذف حسابك في أي وقت من إعدادات الملف الشخصي.</p>
          <h2 className="text-base font-bold">٥. التواصل</h2>
          <p>لأي استفسار حول الخصوصية، يرجى التواصل عبر إعدادات الدعم داخل التطبيق.</p>
        </Card>
      </main>
    </div>
  );
}
