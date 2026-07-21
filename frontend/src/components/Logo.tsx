export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19 C 9 19, 9 5, 14 5 S 20 9, 20 9"
          stroke="var(--route)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="0.1 4.4"
        />
        <circle cx="4" cy="19" r="2.6" fill="var(--sun)" />
        <circle cx="20" cy="9" r="2.6" fill="var(--route)" />
      </svg>
      <span style={{ fontWeight: 800, letterSpacing: "-.02em", fontSize: size * 0.82 }}>
        GabAI
      </span>
    </span>
  );
}
