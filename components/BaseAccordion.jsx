import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";

/**
 * BaseAccordion — generic single-open accordion, now built on the shadcn
 * Accordion primitive. Public API unchanged:
 *   items    – { id, header, actions?, body }[]
 *   openId   – id of the expanded item (controlled, null = all collapsed)
 *   onToggle – (id) => void
 *
 * `actions` render beside the trigger (outside it, so they stay clickable).
 */
const BaseAccordion = ({ items = [], openId = null, onToggle }) => {
  return (
    <Accordion
      type="single"
      collapsible
      value={openId ?? ""}
      onValueChange={(v) => onToggle?.(v || null)}
      className="w-full"
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <div className="flex items-center gap-2 pr-2">
            <AccordionTrigger className="flex-1 py-2.5 text-[13px] font-medium">
              {item.header}
            </AccordionTrigger>
            {item.actions && (
              <div className="flex shrink-0 items-center gap-1">
                {item.actions}
              </div>
            )}
          </div>
          {item.body != null && (
            <AccordionContent className="px-1 pb-4">
              {item.body}
            </AccordionContent>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default BaseAccordion;
