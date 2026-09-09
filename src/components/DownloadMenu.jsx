import { useEffect, useId, useRef, useState } from 'react'

const MENU_ITEMS = [
  { id: 'png', label: 'Download PNG' },
  { id: 'jpg', label: 'Download JPG' },
  { id: 'pdf', label: 'Download PDF' },
]

/**
 * Accessible Download disclosure menu (PNG / JPG / PDF).
 */
export default function DownloadMenu({ disabled = false, onSelect }) {
  const menuId = useId()
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const itemRefs = useRef([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      itemRefs.current[activeIndex]?.focus()
    }
  }, [open, activeIndex])

  function closeMenu(focusTrigger = true) {
    setOpen(false)
    if (focusTrigger) {
      triggerRef.current?.focus()
    }
  }

  function toggleMenu() {
    if (disabled) return
    setOpen((prev) => {
      const next = !prev
      if (next) setActiveIndex(0)
      return next
    })
  }

  function selectItem(id) {
    onSelect?.(id)
    closeMenu(true)
  }

  function handleTriggerKeyDown(event) {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveIndex(0)
      setOpen(true)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(MENU_ITEMS.length - 1)
      setOpen(true)
    }
  }

  function handleMenuKeyDown(event) {
    const lastIndex = MENU_ITEMS.length - 1

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        setActiveIndex((index) => (index >= lastIndex ? 0 : index + 1))
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        setActiveIndex((index) => (index <= 0 ? lastIndex : index - 1))
        break
      }
      case 'Home': {
        event.preventDefault()
        setActiveIndex(0)
        break
      }
      case 'End': {
        event.preventDefault()
        setActiveIndex(lastIndex)
        break
      }
      case 'Escape': {
        event.preventDefault()
        closeMenu(true)
        break
      }
      case 'Tab': {
        setOpen(false)
        break
      }
      default:
        break
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        Download
        <span aria-hidden="true" className="text-xs opacity-90">
          ▾
        </span>
      </button>

      {open && !disabled && (
        <ul
          id={menuId}
          role="menu"
          aria-label="Download formats"
          onKeyDown={handleMenuKeyDown}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-lg shadow-slate-900/10"
        >
          {MENU_ITEMS.map((item, index) => (
            <li key={item.id} role="none">
              <button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                role="menuitem"
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => selectItem(item.id)}
                className="block min-h-11 w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface focus:bg-surface focus:outline-none focus-visible:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
