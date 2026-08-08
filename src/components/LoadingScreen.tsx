export function LoadingScreen({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-ops-bg" : "bg-calm-bg"}`}>
      <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-ops-accent" : "border-calm-accent"}`} />
    </div>
  );
}