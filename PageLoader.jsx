import React from 'react';
import logoImage from './assets/logo.jpg';

/**
 * PageLoader — full-page (or inline) loading overlay. Modernized: theme-aware
 * translucent backdrop with blur, the brand logo framed by dual counter-rotating
 * primary rings, and a tracked label with bouncing dots. Token-driven, no
 * hardcoded colors. API unchanged: { isLoading, fullScreen }.
 */
const PageLoader = ({ isLoading = true, fullScreen = true }) => {
  if (!isLoading) return null;

  return (
    <div
      className={[
        'z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0' : 'relative min-h-[400px] w-full rounded-xl',
      ].join(' ')}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex size-24 items-center justify-center">
          {/* outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/15 border-t-primary [animation-duration:900ms]" />
          {/* inner counter-rotating arc */}
          <div className="absolute inset-[10px] animate-spin rounded-full border border-primary/10 border-b-primary/60 [animation-direction:reverse] [animation-duration:1400ms]" />
          {/* logo */}
          <img
            src={logoImage?.src || logoImage}
            alt="Loading"
            className="size-14 rounded-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Loading
          </p>
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
      </div>

      <style>{`
        @keyframes dw-loader-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
