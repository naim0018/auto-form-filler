import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectPopoverProps {
  label?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  containerClassName?: string;
  variant?: 'light' | 'dark';
}

const SelectPopover: React.FC<SelectPopoverProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  containerClassName = '',
  variant = 'light',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    placeAbove: false,
  });

  const isLight = variant === 'light';

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverMaxHeight = 240; // max-h-60 = 15rem = 240px
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < popoverMaxHeight && rect.top > spaceBelow;

      setCoords({
        top: placeAbove ? rect.top - 6 : rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        placeAbove,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-100'}`}
        >
          {label}
        </label>
      )}
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm flex items-center justify-between text-left transition-all cursor-pointer outline-none ${
          isLight
            ? 'bg-gray-50 border-gray-300 text-gray-900 hover:border-brand-yellow focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow'
            : 'bg-brand-input border-brand-border text-white hover:border-brand-yellow/50 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow'
        }`}
      >
        <span
          className={
            selectedOption
              ? isLight
                ? 'text-gray-900 font-medium'
                : 'text-white font-medium'
              : 'text-gray-400 font-normal'
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-yellow' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Popover Content Panel (Portaled to document.body) */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.placeAbove ? 'auto' : `${coords.top}px`,
              bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={`border rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-fade-in custom-scrollbar ${
              isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-brand-card border-brand-border text-white'
            }`}
          >
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand-yellow/20 text-yellow-800 font-semibold'
                      : isLight
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-yellow-700 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default SelectPopover;

