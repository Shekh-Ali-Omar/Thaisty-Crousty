import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary",
        secondary: "bg-white/10 text-muted",
        success: "bg-green-500/20 text-green-400",
        warning: "bg-yellow-500/20 text-yellow-400",
        destructive: "bg-red-600/90 text-white shadow-sm",
        outline: "text-foreground border-white/20 glass",
        glass: "glass text-foreground border-white/15",
        sticker: "rounded-none bg-foreground text-background font-anton uppercase border-2 border-primary box-shadow-[3px_3px_0px_#ff5500] -rotate-3 hover:rotate-2 hover:scale-105 transition-transform",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
