/**
 * AppInput — centralized input, now built on the shadcn/ui Input primitive.
 * Token-driven (border-input, bg-background, ring), with prefix/suffix slots
 * and ref forwarding to the inner <input>. Public API unchanged.
 *
 * Props: value, onChange, placeholder, type, disabled, prefix, suffix, error,
 * size ("sm" | "md"), style (wrapper), inputStyle (inner input), className,
 * onFocus, onBlur, ...rest (forwarded to <input>).
 */

import { forwardRef } from 'react';
import { Input } from './components/ui/input';
import { cn } from './lib/utils';

const SIZE = {
  sm: 'h-8 text-sm',
  md: 'h-9',
};

const AppInput = forwardRef(function AppInput(
  {
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
    prefix,
    suffix,
    error = false,
    size = 'md',
    style,
    inputStyle,
    className = '',
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const sizeClass = SIZE[size] || SIZE.md;

  // Simple case: no affixes — render the shadcn Input directly.
  if (!prefix && !suffix) {
    return (
      <Input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error || undefined}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(sizeClass, className)}
        style={{ ...style, ...inputStyle }}
        {...rest}
      />
    );
  }

  // Affix case: token-styled wrapper with focus-within ring + a borderless Input.
  return (
    <div
      className={cn(
        // Mirror the shadcn Input surface exactly so affixed inputs are
        // visually identical to plain ones (rounding, bg, border, focus ring).
        'flex items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
        sizeClass,
        error && 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className
      )}
      style={style}
    >
      {prefix && (
        <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">
          {prefix}
        </span>
      )}
      <Input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        className="h-full flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        style={inputStyle}
        {...rest}
      />
      {suffix && (
        <span className="flex shrink-0 items-center text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
});

export default AppInput;
