import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

const VALID = ["/chat", "/arena", "/profile"] as const;
type Valid = (typeof VALID)[number];

function IndexRedirect() {
  let target: Valid = "/chat";
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("otaku:lastTab");
    if (stored && (VALID as readonly string[]).includes(stored)) {
      target = stored as Valid;
    }
  }
  return <Navigate to={target} replace />;
}
