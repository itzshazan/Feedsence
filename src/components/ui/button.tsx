import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-wider ring-offset-background transition-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[2px] active:shadow-neu-pressed",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.3)] border border-white/20 hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground shadow-neu-card hover:brightness-110",
        outline:
          "border-none bg-background text-foreground shadow-neu-card hover:text-primary",
        secondary:
          "bg-background text-foreground shadow-neu-card hover:text-primary",
        ghost:
          "text-muted-foreground hover:bg-muted hover:shadow-neu-recessed hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline shadow-none active:translate-y-0 active:shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm rounded-lg",
        sm: "h-10 px-4 py-2 text-xs rounded-md",
        lg: "h-14 px-10 py-4 text-base rounded-xl",
        icon: "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
