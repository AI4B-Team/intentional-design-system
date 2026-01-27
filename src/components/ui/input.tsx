import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  onChange?: ((value: string) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void);
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      icon,
      onChange,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        // Check if it's expecting a string or event
        if (onChange.length === 1) {
          try {
            // Try calling with string first
            (onChange as (value: string) => void)(e.target.value);
          } catch {
            // If that fails, call with event
            (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
          }
        } else {
          (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
        }
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-small font-medium text-content mb-1.5"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex w-full px-3.5 py-2.5 rounded-small border bg-background text-body transition-all duration-150",
              "min-h-[44px]", // Touch-friendly target
              "placeholder:text-content-tertiary",
              "focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-secondary",
              "hover:border-content-tertiary",
              icon && "pl-10",
              hasError
                ? "border-destructive ring-2 ring-destructive/10 animate-shake"
                : "border-border",
              className
            )}
            ref={ref}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-small text-content-tertiary mt-1.5">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-small text-destructive mt-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
