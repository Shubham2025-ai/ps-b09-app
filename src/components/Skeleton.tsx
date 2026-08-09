export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-ops-border/40 rounded-lg ${className}`} />;
}