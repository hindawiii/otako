import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Construction } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  component: RewardsPage,
});

function RewardsPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-screen-md px-4 py-10">
        <Card className="border-border/40 bg-card/30 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-neon">
            <PlayCircle className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gradient">تفاعل واربح نقاط</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            شاهد إعلانات قصيرة وأكمل مهام يومية بسيطة لتحصل على نقاط مجانية.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <Construction className="h-4 w-4" /> قيد التطوير
          </div>
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link to="/arena">العودة للساحة</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
