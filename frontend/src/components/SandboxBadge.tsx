/** Amber pill rendered wherever a backend response carried simulated: true. */
export function SandboxBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      <span className="h-1.5 w-1.5 rounded-full bg-sandbox" aria-hidden />
      sandbox
    </span>
  );
}
