import React from "react";
import styles from "./Menu.module.css";

export type MenuOption<T extends string = string> = {
  value: T;
  label: string;
};

export type MenuProps<T extends string = string> = {
  options: MenuOption<T>[];
  value?: T;
  onSelect: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function Menu<T extends string = string>({
  options,
  value,
  onSelect,
  ariaLabel,
  className,
}: MenuProps<T>) {
  return (
    <ul
      className={[styles.panel, className].filter(Boolean).join(" ")}
      role="listbox"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <li key={option.value} role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={option.value === value}
            className={[styles.option, option.value === value ? styles.optionSelected : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default Menu;
