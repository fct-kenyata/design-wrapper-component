import React from 'react';
import logo from '../../assets/logo.jpg';

/**
 * EagleEyeLoader — inline loading state for charts/cards. Modernized to match
 * PageLoader: the brand logo framed by dual counter-rotating primary rings, a
 * tracked label, and bouncing dots. Theme-aware (token-driven). API preserved:
 * { size, variant, showText, text, theme } — variant/theme kept for back-compat.
 */
const EagleEyeLoader = ({
  size = 120,
  showText = true,
  text = 'Loading',
  // eslint-disable-next-line no-unused-vars
  variant = 'default',
  // eslint-disable-next-line no-unused-vars
  theme = 'dark',
}) => {
  const logoSize = Math.round(size * 0.6);
  const innerInset = Math.round(size * 0.1);

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/15 border-t-primary [animation-duration:900ms]" />
        <div
          className="absolute animate-spin rounded-full border border-primary/10 border-b-primary/60 [animation-direction:reverse] [animation-duration:1400ms]"
          style={{ inset: innerInset }}
        />
        <img
          src={logo?.src || logo}
          alt="Loading"
          className="rounded-full object-contain"
          style={{ width: logoSize, height: logoSize }}
        />
      </div>

      {showText && (
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{text}</p>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-primary"
                style={{ animation: 'dw-loader-bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dw-loader-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { .animate-spin { animation: none !important; } }
      `}</style>
    </div>
  );
};

export default EagleEyeLoader;
