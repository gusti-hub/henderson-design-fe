// AutocompleteInput.jsx - Reusable autocomplete component
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export const AutocompleteInput = React.memo(({
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Type or select...',
  allowCustom = true,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        // If allowCustom, keep typed value; otherwise revert to last valid
        if (!allowCustom) {
          const match = options.find(o => (o.value || o) === value);
          setQuery(match ? (o.label || match) : '');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options, allowCustom]);

  const filtered = query
    ? options.filter(o => {
        const label = typeof o === 'string' ? o : o.label;
        const val = typeof o === 'string' ? o : o.value;
        return label.toLowerCase().includes(query.toLowerCase()) ||
               val.toLowerCase().includes(query.toLowerCase());
      })
    : options;

  const handleSelect = (opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const lbl = typeof opt === 'string' ? opt : opt.label;
    setQuery(lbl);
    onChange(val);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    if (allowCustom) onChange(v);
    else {
      const match = options.find(o => {
        const l = typeof o === 'string' ? o : o.label;
        return l.toLowerCase() === v.toLowerCase();
      });
      if (match) onChange(typeof match === 'string' ? match : match.value);
      else onChange('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-16 border rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition-all bg-white ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { setOpen(o => !o); inputRef.current?.focus(); }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {filtered.map((opt, i) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            const isSelected = val === value;
            return (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#005670]/10 transition-colors ${
                  isSelected ? 'bg-[#005670]/10 text-[#005670] font-semibold' : 'text-gray-700'
                }`}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      )}

      {open && query && filtered.length === 0 && allowCustom && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
          <div className="px-4 py-2.5 text-sm text-gray-500 italic">
            Press Enter to use "{query}"
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});