import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] will-change-transform active:scale-[0.98] active:translate-y-0 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-crimson-700 text-white shadow hover:bg-crimson-800 hover:-translate-y-0.5 hover:shadow-md",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5",
        outline:
          "border border-terrain-300 bg-white shadow-sm hover:bg-terrain-100 hover:text-mountain-900 hover:-translate-y-0.5",
        secondary:
          "bg-terrain-200 text-mountain-900 shadow-sm hover:bg-terrain-300 hover:-translate-y-0.5",
        ghost: "hover:bg-terrain-100 hover:text-mountain-900",
        link: "text-crimson-700 underline-offset-4 hover:underline",
        gold: "bg-gold-500 text-mountain-900 shadow hover:bg-gold-600 hover:-translate-y-0.5",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
