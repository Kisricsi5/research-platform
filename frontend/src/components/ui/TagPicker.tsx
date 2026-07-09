import { useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagPickerProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  badgeClass?: string;
}

/**
 * Tag input with type-ahead suggestions from a curated list.
 * Users can pick from suggestions or press Enter / click Add for a custom entry.
 */
export default function TagPicker({
  selected,
  onChange,
  suggestions,
  placeholder = 'Type to search…',
  badgeClass = 'badge-blue',
}: TagPickerProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const q = input.trim().toLowerCase();
    const available = suggestions.filter((s) => !selected.includes(s));
    if (!q) return available.slice(0, 8);
    return available
      .filter((s) => s.toLowerCase().includes(q))
      .sort((a, b) => {
        // startsWith matches first
        const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.localeCompare(b);
      })
      .slice(0, 8);
  }, [input, suggestions, selected]);

  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !selected.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...selected, trimmed]);
    }
    setInput('');
    setHighlight(0);
  };

  const remove = (tag: string) => onChange(selected.filter((t) => t !== tag));

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((tag) => (
            <span key={tag} className={`${badgeClass} flex items-center gap-1`}>
              {tag}
              <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setOpen(true); setHighlight(0); }}
            onFocus={() => { if (blurTimer.current) clearTimeout(blurTimer.current); setOpen(true); }}
            onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (open && matches[highlight] && input.trim()) add(matches[highlight]);
                else add(input);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, matches.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            className="input flex-1"
            placeholder={placeholder}
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-autocomplete="list"
          />
          <button type="button" onClick={() => add(input)} className="btn-secondary gap-1">
            <Plus className="h-4 w-4" />Add
          </button>
        </div>

        {open && matches.length > 0 && (
          <ul
            className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-card-hover py-1"
            role="listbox"
          >
            {matches.map((s, i) => (
              <li key={s} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(s); }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                    i === highlight ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
            {input.trim() && !matches.some((m) => m.toLowerCase() === input.trim().toLowerCase()) && (
              <li className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(input); }}
                  className="w-full text-left px-3.5 py-2 text-sm text-gray-500"
                >
                  Add "<span className="font-medium text-gray-800">{input.trim()}</span>"
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
