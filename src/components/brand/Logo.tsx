import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="StreamVerse home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Radio className="size-5" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          Stream<span className="text-primary">Verse</span>
        </span>
      )}
    </Link>
  );
}