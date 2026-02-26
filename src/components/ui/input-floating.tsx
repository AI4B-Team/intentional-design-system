import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "placeholder"> {
  label: string;
  error?: string;
  hint?: string;
  onChange?: ((value: string) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void);
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, hint, onChange, disabled, required, id, value, defaultValue, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
    const isFloating = isFocused || hasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;
      if (onChange.length === 1) {
        try {
          (onChange as (value: string) => void)(e.target.value);
        } catch {
          (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
        }
      } else {
        (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
      }
    };

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              "peer flex w-full px-3.5 pt-5 pb-1.5 rounded-lg border bg-background text-body transition-all duration-150",
              "min-h-[52px]",
              "shadow-inner-sm",
              "placeholder:text-transparent",
              "focus-visible:outline-none focus-visible:border-primary/60",
              "focus-visible:shadow-[0_0_0_3px_hsl(160_84%_39%_/_0.12),inset_0_1px_2px_rgba(0,0,0,0.04)]",
              "hover:border-border/80 hover:shadow-inner-sm",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
              "read-only:bg-muted/20",
              hasError
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border",
              className
            )}
            ref={ref}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
            placeholder={label}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3.5 transition-all duration-200 pointer-events-none origin-left",
              isFloating
                ? "top-1.5 text-tiny font-medium text-primary/70 scale-100"
                : "top-1/2 -translate-y-1/2 text-body text-muted-foreground/50",
              hasError && isFloating && "text-destructive/70"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-small text-muted-foreground mt-1.5">
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
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
