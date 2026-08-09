import { useState } from "react";
import { Check, Bell, Shield, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusLevel = "safe" | "watch" | "risk";

const STATUS_CONFIG: Record<
  StatusLevel,
  { icon: LucideIcon; classes: string }
> = {
  safe: {
    icon: Check,
    classes: "bg-cozy-status-safe/10 text-cozy-status-safe dark:text-cozy-status-safe-dark",
  },
  watch: {
    icon: Bell,
    classes: "bg-cozy-status-watch/10 text-cozy-status-watch dark:text-cozy-status-watch-dark",
  },
  risk: {
    icon: Shield,
    classes: "bg-cozy-status-risk/10 text-cozy-status-risk dark:text-cozy-status-risk-dark",
  },
};

export interface StatusBadgeProps {
  level: StatusLevel;
  children: React.ReactNode;
  /** Play the one-time "reward" pulse — reserve for genuine risk→safe resolutions. */
  pulseOnMount?: boolean;
  className?: string;
}

export function StatusBadge({
  level,
  children,
  pulseOnMount = false,
  className,
}: StatusBadgeProps) {
  const [pulsing, setPulsing] = useState(pulseOnMount && level === "safe");
  const { icon: Icon, classes } = STATUS_CONFIG[level];

  return (
    <span
      onAnimationEnd={() => setPulsing(false)}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        classes,
        pulsing && "motion-safe:animate-cozy-safe-pulse",
        className,
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
      {children}
    </span>
  );
}
