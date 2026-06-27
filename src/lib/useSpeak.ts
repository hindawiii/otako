// Web Speech API hook — mirrors the original speakJP() helper in arena-rooms.html
import { useCallback } from "react";

export type SpeakRate = "normal" | "slow";

export function useSpeak(lang: string = "ja-JP") {
  return useCallback(
    (text: string, rate: SpeakRate = "normal") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = rate === "slow" ? 0.55 : 0.95;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
      } catch {
        /* noop */
      }
    },
    [lang],
  );
}
