import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50 min-h-12 min-w-12 px-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-black shadow-[0_0_24px_rgba(255,140,0,0.35)] hover:bg-primary-secondary hover:shadow-[0_0_32px_rgba(255,140,0,0.45)] hover:scale-[1.02]",
        glass:
          "glass text-foreground hover:glass-strong hover:scale-[1.02] border-white/15",
        secondary:
          "glass-strong text-foreground hover:border-white/25",
        ghost: "hover:glass text-foreground",
        destructive: "bg-red-600/90 text-white hover:bg-red-600",
        outline:
          "border border-primary/40 text-primary glass hover:glass-glow hover:scale-[1.02]",
        brutalist:
          "rounded-none bg-primary text-black font-anton uppercase tracking-wide border-2 border-primary box-shadow-[6px_6px_0px_#fff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#fff]",
        "brutalist-ghost":
          "rounded-none bg-transparent text-primary font-anton uppercase tracking-wide border-2 border-primary box-shadow-[4px_4px_0px_#ff5500] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#ff5500]",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-3 text-xs rounded-lg",
        lg: "h-14 px-7 text-base rounded-2xl",
        icon: "h-12 w-12 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
