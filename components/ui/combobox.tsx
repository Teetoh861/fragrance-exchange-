"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A type-ahead suggestion input with a real, always-visible dropdown —
 * unlike native <datalist>, which Safari (including iOS) renders
 * inconsistently or not at all. Still a free-typed field: nothing in
 * `suggestions` is required to submit.
 */
export function Combobox({
  id,
  name,
  suggestions,
  defaultValue,
  type = "text",
  required,
  maxLength,
  min,
  max,
  className,
}: {
  id: string;
  name: string;
  suggestions: readonly (string | number)[];
  defaultValue?: string;
  type?: "text" | "number";
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions
    .map(String)
    .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 8);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        name={name}
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        value={value}
        min={min}
        max={max}
        required={required}
        maxLength={maxLength}
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so a click on a suggestion registers before the list unmounts.
          setTimeout(() => setOpen(false), 150);
        }}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40",
          className
        )}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-stone-100"
                onMouseDown={(e) => {
                  e.preventDefault(); // keep focus so onBlur doesn't fire first
                  setValue(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
