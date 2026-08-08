import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium font-sans transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cozy-sage-light dark:focus-visible:ring-cozy-sage-dark disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-cozy-sage-light hover:bg-cozy-sage-light/90 hover:scale-[1.01] dark:bg-cozy-sage-dark dark:hover:bg-cozy-sage-dark/90 text-white dark:text-slate-950 shadow-sm active:scale-[0.98]",
        outline:
          "border border-stone-200/50 dark:border-white/10 bg-cozy-card-light dark:bg-cozy-card-dark text-cozy-sage-light dark:text-cozy-sage-dark hover:bg-cozy-bg-light dark:hover:bg-cozy-bg-dark active:scale-[0.98]",
      },
      size: {
        default: "px-5 py-3 text-base",
        sm: "px-3.5 py-2 text-sm",
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
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";
