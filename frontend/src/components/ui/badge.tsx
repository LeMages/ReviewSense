import { cn } from "@/lib/utils"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "secondary" | "destructive" | "outline"
}) {
  return (
    <div
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
        variant === "default" && "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow",
        variant === "secondary" && "border-transparent bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
        variant === "destructive" && "border-transparent bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] shadow",
        variant === "outline" && "text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
