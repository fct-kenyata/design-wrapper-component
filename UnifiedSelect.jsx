/**
 * UnifiedSelect — centralized select, now built on shadcn/ui primitives.
 *
 *   • non-searchable → shadcn Select (Radix)
 *   • searchable     → shadcn Popover + Command (combobox)
 *
 * Public API unchanged:
 *   value, onChange(value), options ([{value,label}] | string[]), placeholder,
 *   mode ("native" | "custom"), searchable, disabled, style, menuStyle,
 *   className, error, size ("sm" | "md").
 */

import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from './components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './components/ui/command';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';

/** Normalise options → always [{ value, label }] */
function normalise(options) {
  if (!Array.isArray(options)) return [];
  return options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  style,
  menuStyle,
  className,
  error,
  size,
}) {
  const [open, setOpen] = useState(false);
  const items = normalise(options);
  const selected = items.find((o) => String(o.value) === String(value)) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={error || undefined}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            size === 'sm' ? 'h-8' : 'h-9',
            !selected && 'text-muted-foreground',
            className
          )}
          style={style}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        style={menuStyle}
      >
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            <CommandGroup>
              {items.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      String(opt.value) === String(value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PlainSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  style,
  className,
  error,
  size,
}) {
  const items = normalise(options);
  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(v) => onChange?.(v)}
      disabled={disabled}
    >
      <SelectTrigger
        size={size === 'sm' ? 'sm' : 'default'}
        aria-invalid={error || undefined}
        className={cn('w-full', className)}
        style={style}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function UnifiedSelect(props) {
  const { mode = 'native', searchable = false, ...rest } = props;
  if (searchable || mode === 'custom') return <SearchableSelect {...rest} />;
  return <PlainSelect {...rest} />;
}
