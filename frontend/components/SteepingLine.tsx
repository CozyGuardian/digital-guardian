export function SteepingLine({
  animate = false,
  className = "",
}: {
  animate?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 40" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 2c-4 5 4 7 0 12s4 7 0 12s4 7 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="20 80"
        className={`text-cozy-sage-light dark:text-cozy-sage-dark opacity-20 ${
          animate ? "motion-safe:animate-cozy-steep" : ""
        }`}
      />
    </svg>
  );
}
