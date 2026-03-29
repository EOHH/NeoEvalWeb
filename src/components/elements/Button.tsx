import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // 🔥 FIX UX: Transiciones suaves, scale al hacer click, anillos de enfoque modernos y select-none
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none',
  {
    variants: {
      variant: {
        // Colores más vibrantes y sombras suaves
        default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg shadow-indigo-600/20',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg shadow-red-500/20',
        outline: 'border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-300',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
        link: 'text-indigo-600 underline-offset-4 hover:underline',
        // Extra: Variante Glassmorphism por si la necesitas sobre imágenes de fondo
        glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)]',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-14 rounded-2xl px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';