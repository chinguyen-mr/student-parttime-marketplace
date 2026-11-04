import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * CustomDropdown — JobNest Premium Select & Filter Component
 * Matches Design System specs:
 * - Brand Colors: Primary (#594675), Lavender Hover (#F4F1F8), Border (#EAE5F0), Text (#30283A)
 * - Rounded corners 8-12px, soft elevation shadow, Checkmark on selected option
 * - Accessible: keyboard navigation (Arrows, Enter, Space, Escape), focus rings, ARIA roles
 * - Dual input modes: accepts `options` prop or `<option>` children
 * - Full compatibility with standard React event handlers: `e.target.value`
 */
export default function CustomDropdown({
  value,
  onChange,
  onValueChange,
  options = [],
  children,
  placeholder = 'Chọn một mục...',
  disabled = false,
  name,
  id,
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: IconComponent,
  searchable = false,
  searchPlaceholder = 'Tìm kiếm lựa chọn...',
  clearable = false,
  className = '',
  style = {},
  triggerStyle = {},
  menuStyle = {},
  align = 'left', // 'left' | 'right'
  maxHeight = 280,
  minMenuWidth,
  required = false,
  error = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const internalId = useId();
  const dropdownId = id || internalId;

  // Normalize options from either options prop or option children
  const normalizedOptions = useMemo(() => {
    if (options && options.length > 0) {
      return options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            value: opt.value !== undefined ? opt.value : opt.label,
            label: opt.label !== undefined ? opt.label : String(opt.value),
            badge: opt.badge,
            icon: opt.icon,
            disabled: Boolean(opt.disabled),
            subtext: opt.subtext,
          };
        }
        return {
          value: opt,
          label: String(opt),
          disabled: false,
        };
      });
    }

    if (children) {
      const list = [];
      React.Children.forEach(children, child => {
        if (React.isValidElement(child)) {
          list.push({
            value: child.props.value !== undefined ? child.props.value : child.props.children,
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
            badge: child.props['data-badge'],
            icon: child.props['data-icon'],
            subtext: child.props['data-subtext'],
          });
        }
      });
      return list;
    }

    return [];
  }, [options, children]);

  // Filter options if searchable is enabled
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(opt => {
      const labelStr = typeof opt.label === 'string' ? opt.label : String(opt.value || '');
      return labelStr.toLowerCase().includes(query);
    });
  }, [normalizedOptions, searchable, searchQuery]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find(opt => String(opt.value) === String(value)) || null;
  }, [normalizedOptions, value]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
    } else {
      // Find index of current value in filtered list
      const idx = filteredOptions.findIndex(opt => String(opt.value) === String(value));
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, searchable, filteredOptions, value]);

  // Keep highlighted item in view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-dropdown-item]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option) => {
    if (disabled || option.disabled) return;
    const nextValue = option.value;
    setIsOpen(false);

    if (onValueChange) {
      onValueChange(nextValue);
    }

    if (onChange) {
      // Create synthetic event matching HTML select event signature
      const syntheticEvent = {
        target: { name: name || '', value: nextValue, id: dropdownId },
        currentTarget: { name: name || '', value: nextValue, id: dropdownId },
        value: nextValue,
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const emptyValue = '';
    if (onValueChange) onValueChange(emptyValue);
    if (onChange) {
      onChange({
        target: { name: name || '', value: emptyValue, id: dropdownId },
        currentTarget: { name: name || '', value: emptyValue, id: dropdownId },
        value: emptyValue,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => {
          let next = prev + 1;
          while (next < filteredOptions.length && filteredOptions[next].disabled) {
            next++;
          }
          return next < filteredOptions.length ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next].disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      case 'Enter':
      case ' ':
        if (e.key === ' ' && searchable && e.target === searchInputRef.current) {
          // Allow spaces in search input
          return;
        }
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Dimensions based on size prop
  const sizeStyles = {
    sm: { height: 36, padding: '6px 10px', fontSize: 12.5, radius: 8 },
    md: { height: 42, padding: '8px 14px', fontSize: 13.5, radius: 10 },
    lg: { height: 46, padding: '10px 16px', fontSize: 14.5, radius: 12 },
  }[size] || { height: 42, padding: '8px 14px', fontSize: 13.5, radius: 10 };

  return (
    <div
      ref={containerRef}
      className={`jobnest-dropdown-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        minWidth: 0,
        ...style,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for HTML form submission compatibility */}
      <input
        type="hidden"
        name={name}
        id={dropdownId}
        value={value !== undefined && value !== null ? value : ''}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        id={`${dropdownId}-trigger`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${dropdownId}-menu`}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          minHeight: sizeStyles.height,
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          borderRadius: sizeStyles.radius,
          background: disabled ? '#F8FAFC' : '#FFFFFF',
          border: error ? '1.5px solid #EF4444' : isOpen ? '1.5px solid #594675' : '1px solid #EAE5F0',
          boxShadow: isOpen 
            ? '0 0 0 3px rgba(89, 70, 117, 0.12), 0 2px 8px rgba(89, 70, 117, 0.06)' 
            : '0 1px 2px rgba(48, 40, 58, 0.04)',
          color: disabled ? '#94A3B8' : '#30283A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          userSelect: 'none',
          ...triggerStyle,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen && !error) {
            e.currentTarget.style.borderColor = '#806A9F';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(89, 70, 117, 0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen && !error) {
            e.currentTarget.style.borderColor = '#EAE5F0';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(48, 40, 58, 0.04)';
          }
        }}
        onFocus={(e) => {
          if (!disabled && !isOpen && !error) {
            e.currentTarget.style.borderColor = '#594675';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(89, 70, 117, 0.12)';
          }
        }}
        onBlur={(e) => {
          if (!disabled && !isOpen && !error) {
            e.currentTarget.style.borderColor = '#EAE5F0';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(48, 40, 58, 0.04)';
          }
        }}
      >
        {/* Left Side: Optional Icon & Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, overflow: 'hidden' }}>
          {IconComponent && (
            <IconComponent size={size === 'sm' ? 14 : 16} color={isOpen ? '#594675' : '#806A9F'} style={{ flexShrink: 0 }} />
          )}
          {selectedOption?.icon && (
            <span style={{ display: 'inline-flex', flexShrink: 0 }}>{selectedOption.icon}</span>
          )}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: selectedOption && selectedOption.value !== '' ? 600 : 500,
              color: selectedOption && selectedOption.value !== '' ? '#30283A' : '#777080',
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 99,
                background: '#F4F1F8',
                color: '#594675',
                flexShrink: 0,
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* Right Side: Clear button & Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {clearable && selectedOption && selectedOption.value !== '' && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              style={{
                display: 'inline-flex',
                padding: 2,
                borderRadius: 4,
                color: '#94A3B8',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              title="Xóa lựa chọn"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={size === 'sm' ? 14 : 16}
            color={isOpen ? '#594675' : '#806A9F'}
            style={{
              transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${dropdownId}-menu`}
            role="listbox"
            aria-labelledby={`${dropdownId}-trigger`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              [align === 'right' ? 'right' : 'left']: 0,
              minWidth: minMenuWidth || '100%',
              maxWidth: '92vw',
              background: '#FFFFFF',
              borderRadius: sizeStyles.radius,
              border: '1px solid #EAE5F0',
              boxShadow: '0 12px 32px -4px rgba(89, 70, 117, 0.18), 0 4px 12px -2px rgba(89, 70, 117, 0.08)',
              padding: 6,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              ...menuStyle,
            }}
          >
            {/* Optional Search Bar */}
            {searchable && (
              <div
                style={{
                  position: 'relative',
                  padding: '6px 8px 8px 8px',
                  borderBottom: '1px solid #F4F1F8',
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#F8FAFC',
                    border: '1px solid #EAE5F0',
                    borderRadius: 6,
                    padding: '6px 10px',
                  }}
                >
                  <Search size={14} color="#806A9F" style={{ flexShrink: 0 }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 12.5,
                      color: '#30283A',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#94A3B8',
                        display: 'flex',
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Scrollable Options List */}
            <div
              ref={listRef}
              style={{
                maxHeight: maxHeight,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    fontSize: 12.5,
                    color: '#777080',
                    fontWeight: 500,
                  }}
                >
                  Không tìm thấy lựa chọn phù hợp
                </div>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = String(opt.value) === String(value);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={`${opt.value}-${index}`}
                      data-dropdown-item
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      onClick={() => !opt.disabled && handleSelect(opt)}
                      onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                      style={{
                        padding: size === 'sm' ? '8px 10px' : '10px 14px',
                        borderRadius: 8,
                        fontSize: sizeStyles.fontSize,
                        lineHeight: 1.4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        opacity: opt.disabled ? 0.45 : 1,
                        background: isSelected
                          ? '#F4F1F8'
                          : isHighlighted
                          ? '#F8F6FA'
                          : 'transparent',
                        color: isSelected
                          ? '#594675'
                          : isHighlighted
                          ? '#49375F'
                          : '#30283A',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'background-color 0.14s ease, color 0.14s ease',
                        userSelect: 'none',
                      }}
                    >
                      {/* Left side: option content */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                        {opt.icon && (
                          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{opt.icon}</span>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {opt.label}
                          </div>
                          {opt.subtext && (
                            <div style={{ fontSize: 11, color: '#777080', fontWeight: 400, marginTop: 1 }}>
                              {opt.subtext}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Badge and Checkmark */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: 99,
                              background: isSelected ? '#594675' : '#EAE5F0',
                              color: isSelected ? '#FFFFFF' : '#594675',
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && (
                          <Check
                            size={16}
                            color="#594675"
                            strokeWidth={2.6}
                            style={{ flexShrink: 0 }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export subcomponents for convenient composition syntax
CustomDropdown.Option = function CustomDropdownOption({ value, children, disabled, badge, icon, subtext }) {
  return null; // Used purely as a data child container
};
