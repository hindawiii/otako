import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "ساحة الأوتاكو — أوتاكو" }] }),
  component: ArenaPage,
});

function ArenaPage() {
  return (
    <div dir="rtl" className="mx-auto max-w-screen-md px-0 pb-28">
      <iframe
        src="/embeds/arena-rooms.html"
        title="ساحة الأوتاكو"
        className="block w-full"
        style={{ height: "calc(100vh - 7rem)", border: 0, background: "#0a0a1a" }}
      />
    </div>
  );
}
