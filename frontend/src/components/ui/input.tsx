import { Input as BaseInput } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, ...props }: BaseInput.Props) {
  return (
    <BaseInput
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--color-input)] bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
