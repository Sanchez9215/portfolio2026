import React from "react";
import styles from "./FilterTabs.module.css";
import Icon from "./Icon";
import { Tooltip, TooltipProps } from "./Tooltip";

export type FilterTabOption<T extends string = string> = {
  value: T;
  label: string;
  stat?: string;
  disabled?: boolean;
  tooltip?: Omit<TooltipProps, "children" | "className">;
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

        if (large) {
          // Large tabs carry a tooltip trigger, which renders its own <button> — a <button>
          // can't nest inside another <button>, so this variant uses a div with role="radio"
          // plus manual keyboard handling instead of a native button (see built-components.md).
          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={selected}
              aria-disabled={option.disabled || undefined}
              tabIndex={option.disabled ? -1 : 0}
              className={[
                styles.tab,
                styles.tabLarge,
                selected ? styles.selected : "",
                option.disabled ? styles.tabLargeDisabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => !option.disabled && onChange(option.value)}
              onKeyDown={(e) => {
                if (option.disabled) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.value);
                }
              }}
            >
              <span className={styles.labelRow}>
                <span>{option.label}</span>
                {option.tooltip ? (
                  <Tooltip {...option.tooltip}>
                    <Icon name="InfoCircle" className={styles.infoIcon} />
                  </Tooltip>
                ) : (
                  <Icon name="InfoCircle" className={styles.infoIcon} />
                )}
              </span>
              <span className={styles.statValue}>{option.stat}</span>
            </div>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            className={[styles.tab, sizeClass, selected ? styles.selected : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
