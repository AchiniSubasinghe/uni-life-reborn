import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl px-4 py-2 text-sm",
        "bg-white/[0.06] backdrop-blur-xl",
        "border border-white/[0.10]",
        "text-foreground placeholder:text-muted-foreground",
        "transition-all duration-200 outline-none",
        "focus-visible:bg-white/[0.09] focus-visible:border-white/[0.20] focus-visible:ring-0",
        "disabled:pointer-events-none disabled:opacity-50",
        "file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:border-destructive/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
