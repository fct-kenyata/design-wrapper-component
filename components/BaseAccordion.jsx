import React from "react";
import { getLiveSidebarColors } from "@design-pattern/colors.js";

const ChevronIcon = ({ open, color }) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            flexShrink: 0,
        }}
    >
        <path
            d="M4 2l4 4-4 4"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/**
 * BaseAccordion — generic single-open accordion.
 *
 * Props
 * ─────
 *   items    – { id, header: string|ReactNode, actions?: ReactNode, body: ReactNode }[]
 *   openId   – id of the currently expanded item (controlled, null = all collapsed)
 *   onToggle – (id) => void  called when the user clicks a header row
 */
const BaseAccordion = ({ items = [], openId = null, onToggle }) => {
    const c = getLiveSidebarColors();

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item, idx) => {
                const isOpen = openId === item.id;

                return (
                    <div
                        key={item.id}
                        style={{
                            borderBottom: `1px solid ${c.border}`,
                            ...(idx === 0 ? { borderTop: `1px solid ${c.border}` } : {}),
                        }}
                    >
                        {/* ── Header row ─────────────────────────────────── */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 14px",
                                background: isOpen ? c.backgroundSoft : "transparent",
                                transition: "background 150ms ease",
                            }}
                        >
                            {/* Left: chevron + label — clicking expands/collapses */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    flex: 1,
                                    minWidth: 0,
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                                onClick={() => onToggle?.(item.id)}
                            >
                                <ChevronIcon open={isOpen} color={c.textMuted} />
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: c.textPrimary,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {item.header}
                                </span>
                            </div>

                            {/* Right: action buttons (edit, delete, etc.) */}
                            {item.actions && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        flexShrink: 0,
                                        marginLeft: 8,
                                    }}
                                >
                                    {item.actions}
                                </div>
                            )}
                        </div>

                        {/* ── Body — CSS max-height animation ────────────── */}
                        <div
                            style={{
                                overflow: "hidden",
                                maxHeight: isOpen ? "1400px" : "0",
                                transition: "max-height 280ms ease",
                            }}
                        >
                            {item.body != null && (
                                <div style={{ padding: "12px 14px 16px" }}>
                                    {item.body}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BaseAccordion;
