import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { searchF1, type F1Category } from '@/lib/f1Database';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  categories: F1Category[];
  /** Called when the user picks a suggestion (click / Enter on a highlighted row). */
  onSelect?: (value: string) => void;
  /** Called on Enter when no suggestion is highlighted (e.g. submit the form). */
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  maxResults?: number;
  'data-testid'?: string;
}

/** Renders the matched portion of `text` in bold (neutral emphasis, no colour). */
function HighlightedMatch({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1 || !query.trim()) return <span>{text}</span>;
  const end = idx + query.trim().length;
  return (
    <span>
      {text.slice(0, idx)}
      <strong className="font-bold text-foreground">{text.slice(idx, end)}</strong>
      {text.slice(end)}
    </span>
  );
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  function AutocompleteInput(
    {
      value,
      onChange,
      categories,
      onSelect,
      onSubmit,
      placeholder,
      className,
      autoFocus,
      maxResults = 8,
      'data-testid': dataTestid,
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const results = useMemo(
      () => searchF1(value, categories, maxResults),
      [value, categories, maxResults],
    );

    const showDropdown = open && results.length > 0;

    // Close on outside click (covers taps outside the input + dropdown).
    useEffect(() => {
      if (!showDropdown) return;
      function handleClick(e: MouseEvent) {
        if (!containerRef.current?.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [showDropdown]);

    // Keep the highlighted row scrolled into view.
    useEffect(() => {
      if (!showDropdown || highlighted < 0) return;
      const node = listRef.current?.children[highlighted] as HTMLElement | undefined;
      node?.scrollIntoView({ block: 'nearest' });
    }, [highlighted, showDropdown]);

    function commit(selected: string) {
      onChange(selected);
      setOpen(false);
      setHighlighted(-1);
      onSelect?.(selected);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Escape') {
        if (showDropdown) {
          e.preventDefault();
          setOpen(false);
          setHighlighted(-1);
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        if (results.length > 0) {
          e.preventDefault();
          setOpen(true);
          setHighlighted((h) => (h + 1) % results.length);
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        if (results.length > 0) {
          e.preventDefault();
          setOpen(true);
          setHighlighted((h) => (h <= 0 ? results.length - 1 : h - 1));
        }
        return;
      }
      if (e.key === 'Enter') {
        if (showDropdown && highlighted >= 0 && highlighted < results.length) {
          e.preventDefault();
          commit(results[highlighted].item);
        } else {
          onSubmit?.();
        }
      }
    }

    return (
      <div ref={containerRef} className="relative w-full">
        <Input
          ref={ref}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
          data-testid={dataTestid}
        />

        {showDropdown && (
          <div
            ref={listRef}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[240px] overflow-y-auto rounded-lg border border-popover-border bg-popover shadow-lg shadow-black/40"
          >
            {results.map((r, i) => (
              <button
                key={`${r.category}:${r.item}`}
                type="button"
                role="option"
                aria-selected={i === highlighted}
                // Prevent the input from blurring before the click registers.
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => commit(r.item)}
                data-testid={`autocomplete-option-${i}`}
                className={`flex min-h-[44px] w-full items-center gap-2 border-b border-border/40 px-3.5 py-2.5 text-left text-sm font-medium text-popover-foreground transition-colors last:border-b-0 ${
                  i === highlighted ? 'bg-secondary' : 'bg-transparent'
                }`}
              >
                <span className="truncate">
                  <HighlightedMatch text={r.item} query={value} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
