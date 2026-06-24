import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/**
 * StatChip — a small tinted square that holds a single icon, giving stat tiles
 * and section headers a quiet shot of color. Tones map to the analyst-calm
 * accent palette (and the severity scale) defined in styles/design-system.css,
 * so each tone resolves to a theme-aware token and reads correctly in light and
 * dark.
 *
 * The tint is the accent at low alpha; the glyph is the accent at full strength
 * — colorful but restful, never a saturated fill.
 */
const statChipVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-lg [&_svg]:pointer-events-none",
  {
    variants: {
      tone: {
        teal: "bg-accent-teal/18 text-accent-teal",
        periwinkle: "bg-accent-periwinkle/18 text-accent-periwinkle",
        sage: "bg-accent-sage/18 text-accent-sage",
        amber: "bg-accent-amber/18 text-accent-amber",
        coral: "bg-accent-coral/18 text-accent-coral",
        violet: "bg-accent-violet/18 text-accent-violet",
        critical: "bg-critical/18 text-critical",
        high: "bg-high/18 text-high",
        medium: "bg-medium/18 text-medium",
        low: "bg-low/18 text-low",
        muted: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-9 [&_svg]:size-[18px]",
        lg: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      tone: "periwinkle",
      size: "md",
    },
  }
)

export type StatChipTone = NonNullable<
  VariantProps<typeof statChipVariants>["tone"]
>

function StatChip({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statChipVariants>) {
  return (
    <span
      data-slot="stat-chip"
      className={cn(statChipVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { StatChip, statChipVariants }
