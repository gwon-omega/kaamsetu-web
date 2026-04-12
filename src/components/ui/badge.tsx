import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-crimson-700 text-white shadow hover:bg-crimson-800",
        secondary:
          "border-transparent bg-terrain-200 text-mountain-900 hover:bg-terrain-300",
        destructive:
          "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
        outline: "text-mountain-900 border-terrain-300",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        gold: "border-gold-500/40 bg-gold-300/70 text-mountain-900 shadow-sm",
        available:
          "border-transparent bg-green-500 text-white motion-safe:animate-pulse motion-reduce:animate-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
