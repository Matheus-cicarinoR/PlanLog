import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from '../../lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-amber-400 focus-visible:ring-3 focus-visible:ring-amber-400/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 md:text-sm dark:bg-slate-900/50 dark:disabled:bg-slate-800",
        className
      )}
      {...props}
    />
  )
}

export { Input }
