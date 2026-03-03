import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-white/[0.10] bg-white/[0.06] backdrop-blur-xl px-3 py-2 text-base text-white outline-none transition-[color,box-shadow] placeholder:text-white/30 focus-visible:border-white/[0.18] focus-visible:bg-white/[0.09] focus-visible:ring-[3px] focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-400/50 aria-invalid:ring-red-400/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
