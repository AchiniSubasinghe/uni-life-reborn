import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.08)]",
        destructive:
          "bg-destructive/80 text-white hover:bg-destructive/70 backdrop-blur-sm border border-destructive/30",
        outline:
          "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-foreground hover:bg-white/[0.10] hover:border-white/20",
        secondary:
          "bg-white/[0.08] backdrop-blur-xl border border-white/[0.10] text-foreground/80 hover:bg-white/[0.12]",
        ghost:
          "text-foreground/60 hover:text-foreground hover:bg-white/[0.06]",
        glass:
          "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-white hover:bg-white/[0.10]",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
