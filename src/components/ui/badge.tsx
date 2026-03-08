import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-amber-500/20 border-amber-400/20 text-amber-300 [a&]:hover:bg-amber-500/30",
        secondary:
          "bg-white/[0.07] border-white/[0.10] text-foreground/70 [a&]:hover:bg-white/[0.10]",
        destructive:
          "bg-destructive/20 border-destructive/30 text-red-300 [a&]:hover:bg-destructive/30",
        outline:
          "border-white/[0.12] text-foreground/70 [a&]:hover:bg-white/[0.06]",
        ghost: "border-transparent text-foreground/60 [a&]:hover:bg-white/[0.06]",
        link: "border-transparent text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
