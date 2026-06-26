import { Mic, Crown, VolumeX, UserX, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Visual scaffold for the merged "الغرف الصوتية" tab inside /arena.
// Backend wiring (LiveKit/Agora + voice_rooms table) will land in a follow-up.
// Admin controls (mute/kick/mute-all) are surfaced here as disabled previews
// so the UI contract is in place for the next iteration.
export function VoiceRooms() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl">
        <div className="relative bg-gradient-primary/90 p-5 text-primary-foreground">
          <div className="absolute -end-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-2 backdrop-blur">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">الغرف الصوتية</h2>
              <p className="text-xs opacity-90">تواصل صوتي حي مع مجتمع الأوتاكو</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border/60 bg-card/40 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Crown className="h-4 w-4 text-neon-orange" />
          أدوات المشرف
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          ستفعَّل هذه الأدوات تلقائياً داخل أي غرفة تنشئها أو تديرها.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" disabled className="h-9 gap-1 text-xs">
            <VolumeX className="h-3.5 w-3.5" />
            كتم
          </Button>
          <Button variant="outline" size="sm" disabled className="h-9 gap-1 text-xs">
            <UserX className="h-3.5 w-3.5" />
            طرد
          </Button>
          <Button variant="outline" size="sm" disabled className="h-9 gap-1 text-xs">
            <Users className="h-3.5 w-3.5" />
            كتم الجميع
          </Button>
        </div>
      </Card>

      <Card className="border-border/60 bg-card/40 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-neon">
          <Mic className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold">قريباً جداً 🎙️</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          نُجهّز غرفاً صوتية حية بتأثيرات نيون وأدوات إدارة كاملة. ترقّب التحديث القادم.
        </p>
      </Card>
    </div>
  );
}
