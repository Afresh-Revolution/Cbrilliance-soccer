'use client';

interface Props {
  open: boolean;
  onClick: () => void;
}

export default function MenuBallToggle({ open, onClick }: Props) {
  return (
    <button
      type="button"
      className={`menu-ball-toggle ${open ? 'menu-ball-toggle--open' : ''}`}
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
    >
      <span className="menu-ball-toggle__ring" aria-hidden />
      <span className="menu-ball-toggle__ball" aria-hidden>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" fill="#f4f4f4" stroke="rgba(3, 8, 26, 0.35)" strokeWidth="1" />
          <path
            d="M24 8.5L30.2 18.8L41.5 20.2L33.2 28.2L35.4 39.5L24 34L12.6 39.5L14.8 28.2L6.5 20.2L17.8 18.8L24 8.5Z"
            fill="rgba(3, 8, 26, 0.88)"
          />
          <path d="M24 8.5V18.8L17.8 18.8L6.5 20.2L14.8 28.2" stroke="rgba(3, 8, 26, 0.25)" strokeWidth="0.75" />
          <path d="M24 8.5V18.8L30.2 18.8L41.5 20.2L33.2 28.2" stroke="rgba(3, 8, 26, 0.25)" strokeWidth="0.75" />
          <path d="M14.8 28.2L24 34V39.5" stroke="rgba(3, 8, 26, 0.25)" strokeWidth="0.75" />
          <path d="M33.2 28.2L24 34V39.5" stroke="rgba(3, 8, 26, 0.25)" strokeWidth="0.75" />
          <path d="M6.5 20.2L14.8 28.2L24 34L33.2 28.2L41.5 20.2" stroke="rgba(3, 8, 26, 0.2)" strokeWidth="0.75" />
          <circle cx="24" cy="24" r="22" fill="url(#ball-shine)" />
          <defs>
            <radialGradient id="ball-shine" cx="0.35" cy="0.3" r="0.65">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
            </radialGradient>
          </defs>
        </svg>
      </span>
    </button>
  );
}
