import React, { useEffect, useRef, useState } from "react";
import styles from "./Dropdown.module.css";
import Icon from "./Icon";
import { Menu, MenuOption } from "./Menu";

export type DropdownSize = "small" | "medium" | "large";

export type DropdownOption<T extends string = string> = MenuOption<T>;

export type DropdownProps<T extends string = string> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: DropdownSize;
  disabled?: boolean;
  className?: string;
};

export function Dropdown<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = "medium",
  disabled,
  className,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={[styles.trigger, size !== "medium" ? styles[size] : ""]
          .filter(Boolean)
          .join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected?.label ?? ""}</span>
        <Icon
          name="keyboard_arrow_down"
          color="var(--xops-text-secondary)"
          className={[styles.chevron, open ? styles.chevronOpen : ""].filter(Boolean).join(" ")}
        />
      </button>
      {open && (
        <Menu
          className={styles.panel}
          options={options}
          value={value}
          ariaLabel={ariaLabel}
          onSelect={(selected) => {
            onChange(selected);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default Dropdown;
