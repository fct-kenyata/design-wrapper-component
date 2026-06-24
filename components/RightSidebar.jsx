import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./RightSidebar.css";

const closeIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const RightSidebar = forwardRef(function RightSidebar(
  { title, subtitle, children, width = 420,footer },
  ref
) {
  const [open, setOpen] = useState(false);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);

  useImperativeHandle(
    ref,
    () => ({
      open: openPanel,
      close: closePanel,
      toggle: () => setOpen((prev) => !prev),
      isOpen: () => open,
    }),
    [open, openPanel, closePanel]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  if (typeof document === "undefined") return null;

  const panelWidth = typeof width === "number" ? `${width}px` : width;

  return createPortal(
    <div
      className={`right-sidebar-root ${open ? "open" : "closed"}`}
      aria-hidden={!open}
    >
      <div
        className="right-sidebar-backdrop"
        onClick={closePanel}
        role="presentation"
      />
      <aside
        className="right-sidebar-panel"
        style={{ width: panelWidth, maxWidth: "100vw" }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
      >
        <header className="right-sidebar-header">
          <div className="right-sidebar-heading">
            {title && <h3 className="right-sidebar-title">{title}</h3>}
            {subtitle && <p className="right-sidebar-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="right-sidebar-close"
            onClick={closePanel}
            aria-label="Close panel"
          >
            {closeIcon}
          </button>
        </header>
        <div className="right-sidebar-body">{children}</div>
        {footer && (
            <div className="right-sidebar-footer">{footer}</div>
        )}
      </aside>
    </div>,
    document.body
  );
});

export default RightSidebar;
