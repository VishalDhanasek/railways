/** A more detailed side-view train — locomotive, trailing coach, smoke and spinning wheels. */
export default function DetailedTrain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 92" className={className}>
      {/* Smoke */}
      <circle className="animate-smoke-puff" style={{ animationDelay: '0s' }} cx="72" cy="10" r="4" fill="white" fillOpacity="0.7" />
      <circle className="animate-smoke-puff" style={{ animationDelay: '0.4s' }} cx="72" cy="10" r="4" fill="white" fillOpacity="0.7" />
      <circle className="animate-smoke-puff" style={{ animationDelay: '0.8s' }} cx="72" cy="10" r="4" fill="white" fillOpacity="0.7" />

      {/* Trailing coach */}
      <rect x="108" y="32" width="72" height="40" rx="6" fill="#eef4fa" stroke="#0a1f38" strokeWidth="1.5" />
      <rect x="117" y="40" width="15" height="15" rx="2" fill="#123a68" />
      <rect x="138" y="40" width="15" height="15" rx="2" fill="#123a68" />
      <rect x="159" y="40" width="15" height="15" rx="2" fill="#123a68" />
      <line x1="98" y1="58" x2="108" y2="58" stroke="#0a1f38" strokeWidth="2" />

      {/* Locomotive body */}
      <path d="M10 72 V28 a6 6 0 0 1 6-6 H70 a22 22 0 0 1 22 22 v28 Z" fill="#f5a623" stroke="#0a1f38" strokeWidth="1.5" />
      <rect x="21" y="28" width="19" height="15" rx="2" fill="#123a68" />
      <rect x="44" y="28" width="19" height="15" rx="2" fill="#123a68" />
      <circle cx="15" cy="57" r="4.5" fill="#fff2c9" />
      <rect x="6" y="68" width="86" height="6" rx="2" fill="#0a1f38" />
      <rect x="66" y="10" width="12" height="18" rx="2" fill="#0a1f38" />

      {/* Coach wheels (static) */}
      <circle cx="126" cy="76" r="6.5" fill="#0a1f38" />
      <circle cx="162" cy="76" r="6.5" fill="#0a1f38" />

      {/* Locomotive wheels (spinning) */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} className="animate-spin [animation-duration:0.55s]">
        <circle cx="26" cy="78" r="11" fill="none" stroke="#0a1f38" strokeWidth="2.5" />
        <line x1="26" y1="67" x2="26" y2="89" stroke="#0a1f38" strokeWidth="2" />
        <line x1="15" y1="78" x2="37" y2="78" stroke="#0a1f38" strokeWidth="2" />
      </g>
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} className="animate-spin [animation-duration:0.55s]">
        <circle cx="55" cy="78" r="11" fill="none" stroke="#0a1f38" strokeWidth="2.5" />
        <line x1="55" y1="67" x2="55" y2="89" stroke="#0a1f38" strokeWidth="2" />
        <line x1="44" y1="78" x2="66" y2="78" stroke="#0a1f38" strokeWidth="2" />
      </g>
    </svg>
  );
}
