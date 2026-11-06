/**
 * Ilustrasi garis bertema pastry untuk empty state. Semua dekoratif (aria-hidden):
 * stroke mewarisi warna lembut dari induk, isi memakai aksen pink.
 */

type IllustrationProps = { className?: string };

export function CupcakeIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <path
        d="M34 60 L40 100 Q41 106 47 106 L73 106 Q79 106 80 100 L86 60 Z"
        fill="rgb(var(--softer))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M46 60 L43 106 M60 60 L60 106 M74 60 L77 106" stroke="currentColor" strokeWidth="2" />
      <path
        d="M34 60 Q30 44 46 42 Q48 28 62 30 Q78 30 78 46 Q92 46 88 60 Z"
        fill="rgb(var(--soft))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M60 20 C58 15 51 16 51 22 C51 27 57 30 60 33 C63 30 69 27 69 22 C69 16 62 15 60 20 Z"
        fill="rgb(var(--brand))"
      />
    </svg>
  );
}

export function ReceiptIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <path
        d="M38 26 H82 V98 L74 92 L66 98 L58 92 L50 98 L42 92 L38 98 Z"
        fill="rgb(var(--card))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M48 44 H72 M48 58 H72 M48 72 H64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="30" r="12" fill="rgb(var(--soft))" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M60 25 C58.6 22 54 22.6 54 26 C54 29 58 31 60 33 C62 31 66 29 66 26 C66 22.6 61.4 22 60 25 Z"
        fill="rgb(var(--brand))"
      />
    </svg>
  );
}

export function RecipeBookIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <path
        d="M30 32 Q44 26 60 32 V94 Q44 88 30 94 Z"
        fill="rgb(var(--softer))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M90 32 Q76 26 60 32 V94 Q76 88 90 94 Z"
        fill="rgb(var(--card))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M68 48 H82 M68 60 H82 M68 72 H78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M45 52 C42 48 36 49 36 54 C36 59 42 62 45 65 C48 62 54 59 54 54 C54 49 48 48 45 52 Z"
        fill="rgb(var(--brand))"
      />
    </svg>
  );
}
