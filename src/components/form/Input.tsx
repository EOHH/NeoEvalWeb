import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, id, ...props }, ref) => {
    // Generamos un ID único si no se provee para enlazar el label y el error
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full space-y-1.5">
        <div className="relative group">
          {/* Contenedor del Icono Izquierdo */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-primary pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-gray-400",
              "hover:border-gray-300 hover:bg-gray-50",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/10 focus-visible:border-primary focus-visible:bg-white",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
              leftIcon && "pl-10",
              error && "border-destructive/50 bg-red-50/30 focus-visible:ring-destructive/20 focus-visible:border-destructive hover:border-destructive/70",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />

          {/* Icono de error dentro del input (estilo SaaS moderno) */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive pointer-events-none animate-in fade-in zoom-in duration-200">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Mensaje de error accesible */}
        {error && (
          <p id={errorId} className="text-[13px] font-medium text-destructive animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';