import React from "react";
import styles from "./FilterTabs.module.css";
import Icon from "./Icon";

export type FilterTabOption<T extends string = string> = {
  value: T;
  label: string;
  stat?: string;
  disabled?: boolean;
};

export type FilterTabsProps<T extends string = string> = {
  options: FilterTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "default" | "large";
  size?: "small" | "medium" | "large";
  ariaLabel: string;
  className?: string;
};

export function FilterTabs<T extends string = string>({
  options,
  value,
  onChange,
  variant = "default",
  size = "medium",
  ariaLabel,
  className,
}: FilterTabsProps<T>) {
  const large = variant === "large";
  const sizeClass = !large && size !== "medium" ? styles[size] : undefined;

  return (
    <div
      className={[styles.group, large ? styles.groupLarge : "", className]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            className={[
              styles.tab,
              large ? styles.tabLarge : "",
              sizeClass,
              selected ? styles.selected : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(option.value)}
          >
            {large ? (
              <>
                <span className={styles.labelRow}>
                  <span>{option.label}</span>
                  <Icon name="InfoCircle" className={styles.infoIcon} />
                </span>
                <span className={styles.statValue}>{option.stat}</span>
              </>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
