import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/12 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-muted-foreground",
        success: "border-transparent bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
        warning: "border-transparent bg-[hsl(var(--warning)/0.16)] text-[hsl(var(--warning))]",
        destructive: "border-transparent bg-destructive/12 text-destructive",
        accent: "border-transparent bg-accent/14 text-accent",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
