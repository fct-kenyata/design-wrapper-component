import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

/**
 * ThemeSelection — light/dark toggle.
 *
 * The legacy 4-theme (ocean/sentinel/emerald/signal) selector was retired when
 * the design system collapsed to two themes: light (shadcn default) and dark
 * (EaglEye bluish). This now just flips the `dark` class on <html> and persists
 * the choice. A floating pill by default; pass `floating={false}` for inline.
 */
export const ThemeSelection = ({ floating = true, className = "" }) => {
  const [dark, setDark] = useState(false);

  // Initialise from storage / current DOM state (client only).
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark =
      stored === "dark" ||
      (stored == null && document.documentElement.classList.contains("dark"));
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={
        floating
          ? `fixed bottom-5 right-5 z-[99999] rounded-full shadow-lg ${className}`
          : className
      }
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
};

export default ThemeSelection;
